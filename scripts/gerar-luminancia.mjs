/*
 * Gera src/data/luminanciaDasFotos.json — o brilho médio do miolo de cada foto
 * de src/assets/imagens.
 *
 * Para que serve: a página do Logo aplica a logo sobre uma foto e precisa
 * escolher a que dá mais contraste com a cor dela (preta ou branca). Medir isso
 * no navegador exigiria decodificar as 54 fotos a cada visita — vários MB de
 * PNG para descobrir um número por arquivo. Aqui o cálculo é feito uma vez e o
 * resultado versionado, do mesmo jeito que o catálogo de fontes.
 *
 * Roda à mão, nunca no build:
 *
 *   npm run fotos:luminancia
 *
 * Só é preciso rodar de novo se as fotos mudarem.
 *
 * O decodificador de PNG está aqui dentro de propósito: as imagens são todas
 * RGBA de 8 bits sem entrelaçamento, o que cabe em algumas dezenas de linhas
 * com o zlib do próprio Node, e evita somar uma dependência de imagem ao
 * projeto só por causa deste script.
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { inflateSync } from 'node:zlib'

const AQUI = dirname(fileURLToPath(import.meta.url))
const IMAGENS = join(AQUI, '..', 'src', 'assets', 'imagens')
const SAIDA = join(AQUI, '..', 'src', 'data', 'luminanciaDasFotos.json')

// A logo fica centralizada na moldura, então o que importa é o miolo da foto,
// não as bordas: mede-se a faixa central, 60% da largura por 40% da altura.
const FATIA_LARGURA = 0.6
const FATIA_ALTURA = 0.4

/** Cabeçalho IHDR + todos os IDAT concatenados. */
function lerChunks(bytes) {
  let posicao = 8 // assinatura
  let cabecalho = null
  const dados = []

  while (posicao < bytes.length) {
    const tamanho = bytes.readUInt32BE(posicao)
    const tipo = bytes.toString('ascii', posicao + 4, posicao + 8)
    const inicio = posicao + 8

    if (tipo === 'IHDR') {
      cabecalho = {
        largura: bytes.readUInt32BE(inicio),
        altura: bytes.readUInt32BE(inicio + 4),
        bits: bytes[inicio + 8],
        tipoDeCor: bytes[inicio + 9],
        entrelacado: bytes[inicio + 12],
      }
    } else if (tipo === 'IDAT') {
      dados.push(bytes.subarray(inicio, inicio + tamanho))
    } else if (tipo === 'IEND') break

    posicao = inicio + tamanho + 4 // + CRC
  }

  return { cabecalho, dados: Buffer.concat(dados) }
}

const media = (a, b) => Math.floor((a + b) / 2)

/** Desfaz os filtros por linha (PNG 9.2) e devolve os pixels crus. */
function desfiltrar(cru, largura, altura, canais) {
  const passo = largura * canais
  const saida = Buffer.alloc(passo * altura)

  for (let linha = 0; linha < altura; linha++) {
    const filtro = cru[linha * (passo + 1)]
    const entrada = (linha * (passo + 1)) + 1
    const destino = linha * passo

    for (let i = 0; i < passo; i++) {
      const bruto = cru[entrada + i]
      const esquerda = i >= canais ? saida[destino + i - canais] : 0
      const cima = linha > 0 ? saida[destino - passo + i] : 0
      const diagonal = linha > 0 && i >= canais ? saida[destino - passo + i - canais] : 0

      let valor
      if (filtro === 0) valor = bruto
      else if (filtro === 1) valor = bruto + esquerda
      else if (filtro === 2) valor = bruto + cima
      else if (filtro === 3) valor = bruto + media(esquerda, cima)
      else if (filtro === 4) {
        // Paeth
        const p = esquerda + cima - diagonal
        const de = Math.abs(p - esquerda)
        const dc = Math.abs(p - cima)
        const dd = Math.abs(p - diagonal)
        const melhor = de <= dc && de <= dd ? esquerda : dc <= dd ? cima : diagonal
        valor = bruto + melhor
      } else throw new Error(`Filtro de linha desconhecido: ${filtro}`)

      saida[destino + i] = valor & 0xff
    }
  }

  return saida
}

const canalLinear = (valor) => {
  const v = valor / 255
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
}

/** Luminância relativa média (WCAG) do miolo da imagem, de 0 a 1. */
function luminanciaDoMiolo(caminho) {
  const bytes = readFileSync(caminho)
  const { cabecalho, dados } = lerChunks(bytes)

  if (!cabecalho) throw new Error('sem IHDR')
  if (cabecalho.bits !== 8 || cabecalho.entrelacado !== 0) {
    throw new Error(`só 8 bits sem entrelaçamento (bits ${cabecalho.bits})`)
  }

  const canais = cabecalho.tipoDeCor === 6 ? 4 : cabecalho.tipoDeCor === 2 ? 3 : 0
  if (!canais) throw new Error(`tipo de cor não suportado: ${cabecalho.tipoDeCor}`)

  const { largura, altura } = cabecalho
  const pixels = desfiltrar(inflateSync(dados), largura, altura, canais)

  const meiaL = Math.round((largura * FATIA_LARGURA) / 2)
  const meiaA = Math.round((altura * FATIA_ALTURA) / 2)
  const x0 = Math.round(largura / 2) - meiaL
  const x1 = Math.round(largura / 2) + meiaL
  const y0 = Math.round(altura / 2) - meiaA
  const y1 = Math.round(altura / 2) + meiaA

  let soma = 0
  let quantos = 0
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = (y * largura + x) * canais
      soma +=
        0.2126 * canalLinear(pixels[i]) +
        0.7152 * canalLinear(pixels[i + 1]) +
        0.0722 * canalLinear(pixels[i + 2])
      quantos++
    }
  }

  return soma / quantos
}

const arquivos = readdirSync(IMAGENS).filter((nome) => nome.endsWith('.png')).sort()
const resultado = {}

for (const arquivo of arquivos) {
  const nome = arquivo.replace(/\.png$/, '')
  try {
    resultado[nome] = Number(luminanciaDoMiolo(join(IMAGENS, arquivo)).toFixed(4))
  } catch (erro) {
    console.error(`${arquivo}: ${erro.message}`)
    process.exitCode = 1
  }
}

writeFileSync(SAIDA, `${JSON.stringify(resultado, null, 0)}\n`)
console.log(`${Object.keys(resultado).length} imagens medidas -> ${SAIDA}`)
