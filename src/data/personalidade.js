/*
 * Os cinco eixos do passo de Personalidade.
 *
 * Cada eixo é um par de opostos com um controle de cinco posições entre eles:
 * 1 é totalmente à esquerda, 5 totalmente à direita, 3 é o meio.
 *
 * `imagem` é o nome do arquivo em src/assets/imagens, sem a extensão. Os
 * arquivos são capitalizados e sem acento ("Seria.png", "Descontraida.png"),
 * diferente do rótulo que aparece na tela — e o nome diferencia maiúsculas
 * no GitHub Pages, então tem que bater exatamente.
 */
export const EIXOS = [
  {
    id: 'seria-descontraida',
    esquerda: { nome: 'Séria', imagem: 'Seria' },
    direita: { nome: 'Descontraída', imagem: 'Descontraida' },
  },
  {
    id: 'minimalista-expressiva',
    esquerda: { nome: 'Minimalista', imagem: 'Minimalista' },
    direita: { nome: 'Expressiva', imagem: 'Expressiva' },
  },
  {
    id: 'classica-moderna',
    esquerda: { nome: 'Clássica', imagem: 'Classica' },
    direita: { nome: 'Moderna', imagem: 'Moderna' },
  },
  {
    id: 'sobria-vibrante',
    esquerda: { nome: 'Sóbria', imagem: 'Sobria' },
    direita: { nome: 'Vibrante', imagem: 'Vibrante' },
  },
  {
    id: 'arredondada-angulosa',
    esquerda: { nome: 'Arredondada', imagem: 'Arredondada' },
    direita: { nome: 'Angulosa', imagem: 'Angulosa' },
  },
]

export const POSICOES = [1, 2, 3, 4, 5]

/** Todo eixo começa no meio. */
export const POSICAO_PADRAO = 3

export function posicoesPadrao() {
  return Object.fromEntries(EIXOS.map((eixo) => [eixo.id, POSICAO_PADRAO]))
}
