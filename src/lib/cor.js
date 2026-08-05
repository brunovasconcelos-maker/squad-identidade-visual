/*
 * Conversões de cor, contraste WCAG e geração da escala de tons.
 *
 * Hex circula sempre sem "#" e em maiúsculas, que é como aparece na interface.
 */

// Escala de 10 passos, do mais claro para o mais escuro.
export const PASSOS_DE_TOM = [95, 90, 80, 70, 60, 50, 40, 30, 20, 10]

export const COR_PADRAO = 'B885FC'

const limitar = (valor, minimo, maximo) => Math.min(maximo, Math.max(minimo, valor))

export function hexParaRgb(hex) {
  const limpo = String(hex).trim().replace(/^#/, '')

  const completo =
    limpo.length === 3
      ? limpo
          .split('')
          .map((d) => d + d)
          .join('')
      : limpo

  if (!/^[0-9a-f]{6}$/i.test(completo)) return null

  return {
    r: parseInt(completo.slice(0, 2), 16),
    g: parseInt(completo.slice(2, 4), 16),
    b: parseInt(completo.slice(4, 6), 16),
  }
}

export function hexValido(hex) {
  return hexParaRgb(hex) !== null
}

export function rgbParaHex({ r, g, b }) {
  return [r, g, b]
    .map((canal) => Math.round(limitar(canal, 0, 255)).toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()
}

export function normalizarHex(hex) {
  const rgb = hexParaRgb(hex)
  return rgb ? rgbParaHex(rgb) : null
}

function matiz(r, g, b, max, delta) {
  if (delta === 0) return 0

  const h =
    max === r
      ? ((g - b) / delta) % 6
      : max === g
        ? (b - r) / delta + 2
        : (r - g) / delta + 4

  return (h * 60 + 360) % 360
}

/** h em graus, s e v de 0 a 1. */
export function rgbParaHsv({ r, g, b }) {
  const vr = r / 255
  const vg = g / 255
  const vb = b / 255
  const max = Math.max(vr, vg, vb)
  const min = Math.min(vr, vg, vb)
  const delta = max - min

  return {
    h: matiz(vr, vg, vb, max, delta),
    s: max === 0 ? 0 : delta / max,
    v: max,
  }
}

export function hsvParaRgb({ h, s, v }) {
  const c = v * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = v - c
  const faixa = Math.floor(((h % 360) + 360) % 360 / 60)

  const [r, g, b] = [
    [c, x, 0],
    [x, c, 0],
    [0, c, x],
    [0, x, c],
    [x, 0, c],
    [c, 0, x],
  ][faixa]

  return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 }
}

/** h em graus, s e l de 0 a 100. */
export function rgbParaHsl({ r, g, b }) {
  const vr = r / 255
  const vg = g / 255
  const vb = b / 255
  const max = Math.max(vr, vg, vb)
  const min = Math.min(vr, vg, vb)
  const delta = max - min
  const l = (max + min) / 2

  return {
    h: matiz(vr, vg, vb, max, delta),
    s: delta === 0 ? 0 : (delta / (1 - Math.abs(2 * l - 1))) * 100,
    l: l * 100,
  }
}

export function hslParaRgb({ h, s, l }) {
  const vs = limitar(s, 0, 100) / 100
  const vl = limitar(l, 0, 100) / 100
  const c = (1 - Math.abs(2 * vl - 1)) * vs
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = vl - c / 2
  const faixa = Math.floor(((h % 360) + 360) % 360 / 60)

  const [r, g, b] = [
    [c, x, 0],
    [x, c, 0],
    [0, c, x],
    [0, x, c],
    [x, 0, c],
    [c, 0, x],
  ][faixa]

  return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 }
}

/* --- Contraste (WCAG 2.x) --- */

function canalLinear(valor) {
  const v = valor / 255
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
}

export function luminancia({ r, g, b }) {
  return 0.2126 * canalLinear(r) + 0.7152 * canalLinear(g) + 0.0722 * canalLinear(b)
}

export function razaoDeContraste(hexA, hexB) {
  const a = luminancia(hexParaRgb(hexA))
  const b = luminancia(hexParaRgb(hexB))
  const [maior, menor] = a > b ? [a, b] : [b, a]
  return (maior + 0.05) / (menor + 0.05)
}

/** true quando texto branco lê melhor sobre a cor do que texto preto. */
export function textoClaroSobre(hex) {
  return razaoDeContraste(hex, 'FFFFFF') > razaoDeContraste(hex, '000000')
}

/** Nível WCAG do melhor entre texto branco e preto sobre a cor. */
export function nivelDeContraste(hex) {
  const razao = Math.max(razaoDeContraste(hex, 'FFFFFF'), razaoDeContraste(hex, '000000'))
  if (razao >= 7) return 'AAA'
  if (razao >= 4.5) return 'AA'
  return 'Baixo'
}

/* --- Escala de tons --- */

export function indiceDaAncora(l) {
  let melhor = 0
  PASSOS_DE_TOM.forEach((passo, i) => {
    if (Math.abs(passo - l) < Math.abs(PASSOS_DE_TOM[melhor] - l)) melhor = i
  })
  return melhor
}

export function ancoraDoHex(hex) {
  return indiceDaAncora(rgbParaHsl(hexParaRgb(hex)).l)
}

function criarTom(indice, indiceAncora, hexAncora, h, s) {
  // A âncora mantém o hex exato escolhido; os demais passos recebem o L do
  // seu degrau, preservando matiz e saturação.
  const hex =
    indice === indiceAncora
      ? normalizarHex(hexAncora)
      : rgbParaHex(hslParaRgb({ h, s, l: PASSOS_DE_TOM[indice] }))

  return {
    passo: PASSOS_DE_TOM[indice],
    hex,
    ancora: indice === indiceAncora,
    textoClaro: textoClaroSobre(hex),
  }
}

function montarTons(indices, indiceAncora, hexAncora, h, s) {
  return [...indices]
    .sort((a, b) => a - b)
    .map((indice) => criarTom(indice, indiceAncora, hexAncora, h, s))
}

/**
 * Ancora a cor no degrau mais próximo e, de cada lado independentemente,
 * caminha do degrau mais distante em direção à âncora pegando um sim, um não.
 * A quantidade de tons sai disso — não é fixa.
 */
export function gerarTons(hex) {
  const { h, s, l } = rgbParaHsl(hexParaRgb(hex))
  const indiceAncora = indiceDaAncora(l)
  const indices = new Set([indiceAncora])

  for (let i = 0; i < indiceAncora; i += 2) indices.add(i)
  for (let i = PASSOS_DE_TOM.length - 1; i > indiceAncora; i -= 2) indices.add(i)

  return montarTons(indices, indiceAncora, hex, h, s)
}

/**
 * Próximo degrau vago mais perto da âncora. Empate entre um degrau claro e um
 * escuro à mesma distância vai para o claro, que é o de índice menor.
 */
export function indiceDoProximoTom(tons, hexBase) {
  const indiceAncora = ancoraDoHex(hexBase)
  const ocupados = new Set(tons.map((tom) => PASSOS_DE_TOM.indexOf(tom.passo)))

  let escolhido = null
  for (let i = 0; i < PASSOS_DE_TOM.length; i += 1) {
    if (ocupados.has(i)) continue
    const distancia = Math.abs(i - indiceAncora)
    if (escolhido === null || distancia < escolhido.distancia) escolhido = { i, distancia }
  }

  return escolhido?.i ?? null
}

export function comTomAdicional(cor) {
  const indice = indiceDoProximoTom(cor.tons, cor.hex)
  if (indice === null) return cor.tons

  const { h, s } = rgbParaHsl(hexParaRgb(cor.hex))
  const indiceAncora = ancoraDoHex(cor.hex)
  const indices = cor.tons.map((tom) => PASSOS_DE_TOM.indexOf(tom.passo)).concat(indice)

  return montarTons(indices, indiceAncora, cor.hex, h, s)
}

export function escalaCompleta(tons) {
  return tons.length === PASSOS_DE_TOM.length
}
