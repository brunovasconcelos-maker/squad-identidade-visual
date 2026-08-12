/*
 * A geometria da faixa de cinco posições da Personalidade.
 *
 * Mora fora do React porque duas telas desenham a mesma faixa: o passo, onde
 * ela responde ao clique, e a página de leitura, onde é só o desenho do que
 * ficou escolhido. Com as contas num lugar só, as duas coincidem em qualquer
 * largura em vez de coincidirem por sorte.
 *
 * A faixa útil é a largura menos 18px — o diâmetro de uma bolinha —, porque as
 * das pontas ficam inteiras dentro da caixa, e não centradas na borda. É a
 * mesma conta que o navegador usa para o cursor do <input type="range">, e é o
 * que faz o cursor parar em cima das bolinhas.
 */
import { CENTRO } from '../data/personalidade.js'

/** Onde começa a bolinha de índice `i` (0 a 4), contando da esquerda. */
export function esquerdaDaPosicao(i) {
  return `calc((100% - 18px) * ${i} / 4)`
}

/**
 * A bolinha faz parte do caminho preenchido?
 *
 * Precisa estar do mesmo lado do centro que o valor (daí o produto dos sinais
 * não ser negativo) e não passar dele (daí a comparação das distâncias). No
 * centro só ele próprio entra, e sem valor nenhuma entra.
 */
export function noCaminho(posicao, valor) {
  if (valor == null) return false
  return (
    (posicao - CENTRO) * (valor - CENTRO) >= 0 &&
    Math.abs(posicao - CENTRO) <= Math.abs(valor - CENTRO)
  )
}

/**
 * A faixa cheia, que nasce no centro e cresce para o lado escolhido — e não de
 * uma das pontas. A distância até o centro, em quartos da faixa útil, é a
 * largura; no centro ela tem largura zero.
 */
export function estiloDoPreenchimento(valor) {
  if (valor == null) return { width: 0 }
  const largura = `calc(${Math.abs(valor - CENTRO) / 4} * (100% - 18px))`
  return valor >= CENTRO ? { left: '50%', width: largura } : { right: '50%', width: largura }
}
