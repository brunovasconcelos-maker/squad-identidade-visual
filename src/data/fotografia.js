/*
 * Categorias do passo de Fotografia.
 *
 * `prefixo` é o começo do nome do arquivo em src/assets/imagens — as imagens
 * vão de <prefixo>-1.png a <prefixo>-9.png. Os nomes dos arquivos não seguem
 * os nomes em português, então o mapeamento fica registrado aqui.
 */
export const CATEGORIAS = [
  { id: 'produto', nome: 'Produto', prefixo: 'Product' },
  { id: 'estilo-de-vida', nome: 'Estilo de Vida', prefixo: 'Life-Style' },
  { id: 'retrato', nome: 'Retrato', prefixo: 'Retrato' },
  { id: 'ambiente', nome: 'Ambiente', prefixo: 'Ambiente' },
  { id: 'ilustracao', nome: 'Ilustração', prefixo: 'Illustration' },
  { id: '3d', nome: '3D', prefixo: '3D' },
]

/** Grade 3x3: as fotos vão de 1 a 9 em cada categoria. */
export const NUMEROS_DE_FOTO = [1, 2, 3, 4, 5, 6, 7, 8, 9]

export const MAXIMO_POR_CATEGORIA = 3

/** Quantas fotos foram escolhidas somando todas as categorias. */
export function totalDeFotos(selecoes) {
  return Object.values(selecoes).reduce((soma, fotos) => soma + fotos.length, 0)
}

/** Só as categorias com ao menos uma foto, na ordem em que aparecem nas abas. */
export function categoriasEscolhidas(selecoes) {
  return CATEGORIAS.filter((categoria) => (selecoes[categoria.id]?.length ?? 0) > 0)
}
