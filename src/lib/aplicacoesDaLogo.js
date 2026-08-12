/*
 * Escolhas automáticas das aplicações da logo na página /logo: o degradê e a
 * foto sobre os quais a versão de cor única é apresentada.
 *
 * As duas decisões são a mesma pergunta — o que dá contraste suficiente com uma
 * logo preta ou branca? — e as duas usam a régua de contraste do WCAG que a
 * Paleta de Cores já usa (`razaoDeContraste`), para a página não inventar um
 * critério próprio.
 */
import { luminanciaDaFoto, TODAS_AS_FOTOS } from '../data/fotos.js'
import { razaoDeContraste } from './cor.js'

/** Mínimo do WCAG para texto grande, que é o caso de uma logo. */
const CONTRASTE_MINIMO = 3

/** Ângulo do degradê no Figma (node 6064:4986). */
const ANGULO = 116

/*
 * Reserva para quando não há paleta salva, ou quando nenhuma cor dela contrasta
 * o bastante. São dois pares: um claro para a logo preta e um escuro para a
 * branca — o claro é o próprio degradê do Figma.
 */
const RESERVA = {
  '000000': ['B885FC', 'CCEB87'],
  FFFFFF: ['3B2E63', '10131A'],
}

const css = ([de, para]) =>
  `linear-gradient(${ANGULO}deg, #${de} 0%, #${para} 100%)`

/** Todas as cores disponíveis na paleta: as bases e os tons gerados. */
function coresDaPaleta(paleta) {
  const hexes = []
  for (const cor of paleta ?? []) {
    hexes.push(cor.hex)
    for (const tom of cor.tons ?? []) hexes.push(tom.hex)
  }
  // Sem repetir, e sem perder a ordem — a primeira cor da paleta é a que a
  // pessoa marcou como principal, então vale como desempate.
  return [...new Set(hexes.map((hex) => hex.toUpperCase()))]
}

/**
 * Degradê para apresentar a logo de cor única, tirado da paleta da marca.
 *
 * `corDaLogo` é o hex da logo que vai por cima ('000000' ou 'FFFFFF'). As duas
 * pontas precisam passar do contraste mínimo contra ela: um degradê que
 * contrasta só na metade esquerda não serve. Entre os candidatos aprovados,
 * ficam os dois de maior contraste, evitando repetir a mesma cor.
 */
export function degradeDaMarca(paleta, corDaLogo) {
  const aprovadas = coresDaPaleta(paleta)
    .map((hex) => ({ hex, contraste: razaoDeContraste(hex, corDaLogo) }))
    .filter(({ contraste }) => contraste >= CONTRASTE_MINIMO)
    .sort((a, b) => b.contraste - a.contraste)

  if (aprovadas.length < 2) {
    return { css: css(RESERVA[corDaLogo]), cores: RESERVA[corDaLogo], daPaleta: false }
  }

  const cores = [aprovadas[0].hex, aprovadas[1].hex]
  return { css: css(cores), cores, daPaleta: true }
}

/**
 * A foto do acervo que melhor recebe uma logo preta ou branca.
 *
 * O brilho do miolo de cada foto foi medido fora do navegador e está em
 * src/data/luminanciaDasFotos.json (ver scripts/gerar-luminancia.mjs). Aqui é
 * só a conta do contraste em cima desse número: a logo branca pede a foto mais
 * escura, a preta pede a mais clara.
 */
export function fotoParaLogo(corDaLogo) {
  const luminanciaDaLogo = corDaLogo === 'FFFFFF' ? 1 : 0

  let escolhida = null
  let melhor = -1

  for (const nome of TODAS_AS_FOTOS) {
    const luz = luminanciaDaFoto(nome)
    if (luz === undefined) continue

    const [maior, menor] =
      luminanciaDaLogo > luz ? [luminanciaDaLogo, luz] : [luz, luminanciaDaLogo]
    const contraste = (maior + 0.05) / (menor + 0.05)

    if (contraste > melhor) {
      melhor = contraste
      escolhida = nome
    }
  }

  return { nome: escolhida, contraste: melhor }
}
