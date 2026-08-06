/*
 * Gera src/data/googleFonts.json a partir do pacote google-font-metadata.
 *
 * O pacote traz 55 MB de dados (arquivos CSS, unicode-range, eixos variáveis)
 * e só precisamos de três campos por família: nome, variantes e categoria.
 * Por isso ele é devDependency e o resultado compacto é versionado — o build
 * e o deploy não dependem de rodar isto, e o navegador não baixa os 55 MB.
 *
 * Para atualizar a lista quando o Google publicar novas fontes:
 *   npm run fontes:atualizar
 *
 * Lemos o JSON direto do disco em vez de importar o pacote porque o entry
 * point dele carrega playwright e octokit, que não têm nada a ver com isto.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')
const pacoteInstalado = join(raiz, 'node_modules/google-font-metadata')

// O campo "exports" do pacote não expõe nem o package.json nem a pasta data,
// então lemos os dois pelo caminho no disco.
const ler = (caminho) => JSON.parse(readFileSync(join(pacoteInstalado, caminho), 'utf8'))

const pacote = ler('package.json')
const familias = ler('data/api-response.json')

/**
 * A API do Google usa "regular"/"italic" para o peso 400 e "300italic" para o
 * resto. Normalizamos tudo para "<peso>" e "<peso>i", que é mais curto e
 * evita ter dois formatos no cliente.
 */
function codificarVariante(variante) {
  if (variante === 'regular') return '400'
  if (variante === 'italic') return '400i'

  const [, peso, italico] = variante.match(/^(\d+)(italic)?$/) ?? []
  if (!peso) throw new Error(`Variante em formato inesperado: ${variante}`)
  return italico ? `${peso}i` : peso
}

// Peso crescente e, dentro do mesmo peso, romano antes do itálico — a ordem
// em que as variantes aparecem na grade de checkboxes.
function ordenar(a, b) {
  const pesoA = Number.parseInt(a, 10)
  const pesoB = Number.parseInt(b, 10)
  if (pesoA !== pesoB) return pesoA - pesoB
  return a.endsWith('i') === b.endsWith('i') ? 0 : a.endsWith('i') ? 1 : -1
}

const compacto = familias
  .map((fonte) => [
    fonte.family,
    fonte.variants.map(codificarVariante).sort(ordenar).join(','),
    fonte.category,
  ])
  .sort((a, b) => a[0].localeCompare(b[0], 'en'))

const saida = {
  origem: `${pacote.name}@${pacote.version}`,
  geradoEm: new Date().toISOString().slice(0, 10),
  // [nome, variantes separadas por vírgula, categoria]
  familias: compacto,
}

const destino = join(raiz, 'src/data/googleFonts.json')
writeFileSync(destino, `${JSON.stringify(saida)}\n`)

console.log(
  `${compacto.length} famílias gravadas em src/data/googleFonts.json ` +
    `(${(JSON.stringify(saida).length / 1024).toFixed(1)} kB, fonte: ${saida.origem})`,
)
