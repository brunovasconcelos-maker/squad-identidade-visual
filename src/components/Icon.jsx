import s from './Icon.module.css'

// Os SVGs vêm da biblioteca Phosphor (a mesma usada no Figma) e ficam em
// src/assets/icones. Importamos como texto para o `currentColor` do SVG
// continuar valendo — com <img> a cor ficaria travada.
const arquivos = import.meta.glob('../assets/icones/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const icones = Object.fromEntries(
  Object.entries(arquivos).map(([caminho, svg]) => [
    caminho.split('/').pop().replace('.svg', ''),
    svg,
  ]),
)

export default function Icon({ nome, tamanho = 24, className }) {
  const svg = icones[nome]

  if (!svg) {
    console.warn(`Ícone "${nome}" não encontrado em src/assets/icones.`)
    return null
  }

  return (
    <span
      aria-hidden="true"
      className={[s.icone, className].filter(Boolean).join(' ')}
      style={{ width: tamanho, height: tamanho }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
