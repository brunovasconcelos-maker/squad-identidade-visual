/*
 * Catálogo do Google Fonts e montagem da URL de carregamento.
 *
 * A lista vem de src/data/googleFonts.json, gerada por scripts/gerar-fontes.mjs
 * a partir do pacote google-font-metadata. É um arquivo local: a busca funciona
 * sem backend e sem chave de API.
 *
 * O carregamento em si usa o embed público do Google Fonts (fonts.googleapis.com
 * /css2), que também dispensa chave — ver src/hooks/useFonteDoGoogle.js.
 */
import catalogo from '../data/googleFonts.json'

export const ORIGEM = 'Google Fonts'
export const MAXIMO_SECUNDARIAS = 3

const NOMES_DE_PESO = {
  100: 'Thin',
  200: 'Extralight',
  300: 'Light',
  400: 'Regular',
  500: 'Medium',
  600: 'Semibold',
  700: 'Bold',
  800: 'Extrabold',
  900: 'Black',
}

/** "Light", "Light Italic" — o nome do peso, sem o número. */
export function nomeDaVariante(variante) {
  const nome = NOMES_DE_PESO[variante.peso] ?? variante.peso
  return variante.italico ? `${nome} Italic` : nome
}

/** "Light 300", "Light 300 Italic" — o rótulo que aparece no checkbox. */
function rotuloDaVariante(peso, italico) {
  const nome = NOMES_DE_PESO[peso] ?? peso
  return italico ? `${nome} ${peso} Italic` : `${nome} ${peso}`
}

// "300,300i,400" -> variantes já na ordem em que a grade as exibe.
function lerVariantes(codificadas) {
  return codificadas.split(',').map((chave) => {
    const italico = chave.endsWith('i')
    const peso = Number.parseInt(chave, 10)
    return { chave, peso, italico, rotulo: rotuloDaVariante(peso, italico) }
  })
}

/** Todas as famílias do catálogo, em ordem alfabética. */
export const FAMILIAS = catalogo.familias.map(([familia, variantes, categoria]) => ({
  familia,
  categoria,
  variantes: lerVariantes(variantes),
}))

export const CATALOGO = { origem: catalogo.origem, geradoEm: catalogo.geradoEm }

const semAcento = (texto) =>
  texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

// Índice normalizado paralelo a FAMILIAS, montado uma vez.
const INDICE = FAMILIAS.map((fonte) => semAcento(fonte.familia))

/**
 * Busca por trecho do nome, sem acento e sem diferenciar maiúsculas.
 * Quem começa com o termo vem antes de quem só o contém no meio — digitar
 * "rob" traz Roboto antes de Rambla Robusta.
 */
export function buscarFamilias(texto, limite = 50) {
  const alvo = semAcento(texto.trim())
  if (!alvo) return FAMILIAS.slice(0, limite)

  const comecam = []
  const contem = []

  for (let i = 0; i < FAMILIAS.length; i += 1) {
    const posicao = INDICE[i].indexOf(alvo)
    if (posicao === 0) comecam.push(FAMILIAS[i])
    else if (posicao > 0) contem.push(FAMILIAS[i])
  }

  return comecam.concat(contem).slice(0, limite)
}

/** Fonte escolhida, com todos os pesos disponíveis já marcados. */
export function criarFonte(familia) {
  return {
    familia: familia.familia,
    categoria: familia.categoria,
    origem: ORIGEM,
    variantes: familia.variantes.map((variante) => ({ ...variante, marcado: true })),
  }
}

export function comVarianteAlternada(fonte, chave) {
  if (!fonte) return fonte

  return {
    ...fonte,
    variantes: fonte.variantes.map((variante) =>
      variante.chave === chave ? { ...variante, marcado: !variante.marcado } : variante,
    ),
  }
}

/**
 * Quantas colunas a grade de variantes usa. É o padrão do Figma: no máximo
 * três colunas e no mínimo duas variantes por coluna, então Open Sans (12
 * variantes) fica em 3 colunas de 4 e Edu VIC WA NT Hand (4) em 2 de 2.
 */
export function colunasDeVariantes(total) {
  return Math.min(3, Math.max(1, Math.ceil(total / 2)))
}

/** Distribui as variantes em colunas, preenchendo coluna por coluna. */
export function emColunas(variantes) {
  const colunas = colunasDeVariantes(variantes.length)
  const porColuna = Math.ceil(variantes.length / colunas)

  return Array.from({ length: colunas }, (_, i) =>
    variantes.slice(i * porColuna, (i + 1) * porColuna),
  )
}

/**
 * URL do embed público do Google Fonts para a família e só os pesos marcados.
 *
 * O css2 exige as tuplas do eixo em ordem crescente, e por isso o formato muda
 * conforme haja itálico ou não:
 *   só romano  -> family=Open+Sans:wght@400;700
 *   com itálico -> family=Open+Sans:ital,wght@0,400;0,700;1,400
 *
 * Devolve null quando nada está marcado — aí não há o que carregar.
 */
export function urlDoCss2(fonte) {
  const marcadas = fonte?.variantes.filter((variante) => variante.marcado) ?? []
  if (marcadas.length === 0) return null

  const familia = fonte.familia.replace(/ /g, '+')
  const temItalico = marcadas.some((variante) => variante.italico)

  const eixo = temItalico
    ? `ital,wght@${marcadas
        .map((variante) => [variante.italico ? 1 : 0, variante.peso])
        .sort((a, b) => a[0] - b[0] || a[1] - b[1])
        .map(([italico, peso]) => `${italico},${peso}`)
        .join(';')}`
    : `wght@${marcadas
        .map((variante) => variante.peso)
        .sort((a, b) => a - b)
        .join(';')}`

  return `https://fonts.googleapis.com/css2?family=${familia}:${eixo}&display=swap`
}

/**
 * Peso e estilo de uma amostra da fonte. Só usa variante marcada: pedir um peso
 * que não foi carregado faria o navegador engrossar a fonte por conta própria.
 * Entre as marcadas, a mais perto do `alvo` — 600 no "Aa" do passo, 500 no nome
 * grande da página do tema, que são os pesos dos respectivos desenhos.
 */
export function estiloDaPrevia(fonte, alvo = 600) {
  const marcadas = fonte?.variantes.filter((variante) => variante.marcado) ?? []
  if (marcadas.length === 0) return null

  const romanas = marcadas.filter((variante) => !variante.italico)
  const candidatas = romanas.length > 0 ? romanas : marcadas
  const escolhida = candidatas.reduce((melhor, variante) =>
    Math.abs(variante.peso - alvo) < Math.abs(melhor.peso - alvo) ? variante : melhor,
  )

  return { fontWeight: escolhida.peso, fontStyle: escolhida.italico ? 'italic' : 'normal' }
}

/** Família da fonte escolhida, com a do projeto como reserva enquanto carrega. */
export function familiaCss(fonte) {
  return `'${fonte.familia}', var(--fonte)`
}

/**
 * As variantes marcadas em pares peso a peso: a romana à esquerda, a itálica do
 * mesmo peso à direita.
 *
 * Um lado pode vir nulo — marcar "Bold" sem "Bold Italic" deixa a direita
 * vazia, e a linha continua existindo para as colunas não desalinharem. Os
 * pares saem do peso mais leve para o mais pesado, como no Figma.
 */
export function paresDeVariantes(fonte) {
  const marcadas = fonte?.variantes.filter((variante) => variante.marcado) ?? []
  const pesos = [...new Set(marcadas.map((variante) => variante.peso))].sort((a, b) => a - b)

  return pesos.map((peso) => ({
    peso,
    romana: marcadas.find((v) => v.peso === peso && !v.italico) ?? null,
    italica: marcadas.find((v) => v.peso === peso && v.italico) ?? null,
  }))
}
