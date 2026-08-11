/*
 * URLs dos avatares dos agentes, em src/assets/avatar.
 *
 * Mesma ideia do Icon.jsx e do imagens.js: o Vite resolve a pasta inteira no
 * build, então os arquivos entram no bundle com hash e nada depende de caminho
 * montado à mão em tempo de execução (que quebraria com o `base` do GitHub
 * Pages).
 *
 * As imagens já vêm recortadas em círculo e com o degradê de fundo embutido —
 * não há gradiente nenhum no CSS.
 */
const arquivos = import.meta.glob('../assets/avatar/*.png', {
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

/** URL do avatar de um agente, pelo id (`waz` -> `waz_avatar.png`). */
export function urlDoAvatar(id) {
  return porNome[`${id}_avatar`]
}
