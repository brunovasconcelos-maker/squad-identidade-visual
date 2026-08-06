/*
 * URLs das imagens do passo de Fotografia.
 *
 * Mesma ideia do Icon.jsx: o Vite resolve a pasta inteira no build, então os
 * arquivos entram no bundle com hash e nada depende de caminho montado à mão
 * em tempo de execução (que quebraria com o `base` do GitHub Pages).
 */
const arquivos = import.meta.glob('../assets/imagens/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
})

const porNome = Object.fromEntries(
  Object.entries(arquivos).map(([caminho, url]) => [
    caminho.split('/').pop().replace(/\.png$/, ''),
    url,
  ]),
)

/** URL de <prefixo>-<numero>.png, ou undefined se o arquivo não existir. */
export function urlDaFoto(prefixo, numero) {
  return porNome[`${prefixo}-${numero}`]
}
