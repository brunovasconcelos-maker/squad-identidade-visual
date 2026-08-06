/*
 * Dados de exemplo do passo de Tipografia.
 *
 * É mock: não há busca no Google Fonts nem carregamento de fonte ainda.
 * Clicar num card "seleciona" uma destas fontes só para montar o layout.
 * `colunas` é como o Figma distribui as variantes — 3 colunas para a
 * primária, 2 para a secundária, que tem menos variantes.
 */
export const FONTE_PRIMARIA_EXEMPLO = {
  nome: 'Open Sans',
  origem: 'Google Fonts',
  colunas: 3,
  variantes: [
    { rotulo: 'Light 300', marcado: true },
    { rotulo: 'Light 300 Italic', marcado: true },
    { rotulo: 'Regular 400', marcado: true },
    { rotulo: 'Regular 400 Italic', marcado: true },
    { rotulo: 'Medium 500', marcado: true },
    { rotulo: 'Medium 500 Italic', marcado: true },
    { rotulo: 'Semibold 600', marcado: true },
    { rotulo: 'Semibold 600 Italic', marcado: true },
    { rotulo: 'Bold 700', marcado: true },
    { rotulo: 'Bold 700 Italic', marcado: false },
    { rotulo: 'Extrabold 800', marcado: true },
    { rotulo: 'Extrabold 800 Italic', marcado: false },
  ],
}

export const FONTE_SECUNDARIA_EXEMPLO = {
  nome: 'Edu VIC WA NT Hand',
  origem: 'Google Fonts',
  colunas: 2,
  variantes: [
    { rotulo: 'Regular 400', marcado: true },
    { rotulo: 'Medium 500', marcado: true },
    { rotulo: 'Semibold 600', marcado: true },
    { rotulo: 'Bold 700', marcado: true },
  ],
}

export const MAXIMO_SECUNDARIAS = 3

/** Distribui as variantes em colunas, preenchendo coluna por coluna. */
export function emColunas(variantes, colunas) {
  const porColuna = Math.ceil(variantes.length / colunas)
  return Array.from({ length: colunas }, (_, i) =>
    variantes.slice(i * porColuna, (i + 1) * porColuna),
  )
}
