/*
 * A cor dominante de uma imagem enviada, medida no navegador.
 *
 * Serve ao exemplo de "não use sem contraste" da página do Logo e do Ícone: o
 * fundo daquela moldura tem de ficar quase da cor da marca, e quase da cor de
 * quê depende do arquivo que a pessoa subiu. Um cinza fixo não resolve — uma
 * marca verde clara sobre cinza escuro continua legível, e aí o exemplo do erro
 * não mostra erro nenhum.
 *
 * Aqui a medição é no navegador mesmo, ao contrário do brilho das fotos do
 * acervo (ver scripts/gerar-luminancia.mjs): são poucos arquivos, pequenos, e
 * só o dono deles sabe quais são.
 */
import { hexParaRgb, hslParaRgb, rgbParaHex, rgbParaHsl } from './cor.js'

/** A imagem é reduzida a este quadrado antes de contar as cores. */
const LADO = 48

/** Abaixo disto o pixel é transparente demais para contar. */
const ALFA_MINIMO = 128

/*
 * As cores são agrupadas em baldes de 5 bits por canal (32 níveis) antes de
 * contar. Sem isso o degradê e o antisserrilhado de uma marca só espalhariam a
 * contagem por milhares de tons quase iguais, e nenhum seria dominante.
 */
const BITS = 3

function carregar(url) {
  return new Promise((pronto, falhou) => {
    const imagem = new Image()
    imagem.onload = () => pronto(imagem)
    imagem.onerror = () => falhou(new Error('não foi possível carregar a imagem'))
    imagem.src = url
  })
}

/**
 * A cor que ocupa mais área da imagem, em hex, ou null se não der para medir
 * (arquivo que não carrega, formato que o canvas não desenha, imagem toda
 * transparente).
 *
 * Os pixels transparentes ficam de fora: numa marca em PNG recortado eles são
 * a maioria, e o que interessa é a cor da tinta.
 */
export async function corDominante(url) {
  let pixels
  try {
    const imagem = await carregar(url)
    const tela = document.createElement('canvas')
    tela.width = LADO
    tela.height = LADO
    const pincel = tela.getContext('2d', { willReadFrequently: true })
    pincel.drawImage(imagem, 0, 0, LADO, LADO)
    pixels = pincel.getImageData(0, 0, LADO, LADO).data
  } catch {
    // SVG sem dimensão intrínseca, canvas contaminado, arquivo corrompido: o
    // exemplo cai no fundo de reserva em vez de quebrar a página.
    return null
  }

  const baldes = new Map()

  for (let i = 0; i < pixels.length; i += 4) {
    if (pixels[i + 3] < ALFA_MINIMO) continue

    const r = pixels[i]
    const g = pixels[i + 1]
    const b = pixels[i + 2]
    const chave = ((r >> BITS) << 10) | ((g >> BITS) << 5) | (b >> BITS)

    const balde = baldes.get(chave)
    if (balde) {
      balde.r += r
      balde.g += g
      balde.b += b
      balde.n += 1
    } else {
      baldes.set(chave, { r, g, b, n: 1 })
    }
  }

  let maior = null
  for (const balde of baldes.values()) {
    if (!maior || balde.n > maior.n) maior = balde
  }
  if (!maior) return null

  // A média dentro do balde devolve a cor de verdade, não o canto do balde.
  return rgbParaHex({ r: maior.r / maior.n, g: maior.g / maior.n, b: maior.b / maior.n })
}

/** De quanto a luminosidade anda para o fundo não ficar idêntico à marca. */
const AFASTAMENTO = 9

/**
 * Um fundo quase da mesma cor: mesmo matiz, mesma saturação, e a luminosidade
 * deslocada o suficiente para a marca não sumir de vez, mas pouco o bastante
 * para o contraste ficar ruim de propósito.
 *
 * O deslocamento vai para o lado que cabe — numa marca quase preta ele sobe,
 * numa quase branca ele desce —, senão em cor extrema a conta grudaria no 0 ou
 * no 100 e devolveria o próprio hex.
 */
export function fundoQuaseIgual(hex) {
  const { h, s, l } = rgbParaHsl(hexParaRgb(hex))
  const paraCima = l < 50
  const novoL = paraCima ? Math.min(l + AFASTAMENTO, 100) : Math.max(l - AFASTAMENTO, 0)

  return rgbParaHex(hslParaRgb({ h, s, l: novoL }))
}
