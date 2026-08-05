// Os sete pilares da identidade visual, na ordem em que aparecem na Home.
// `slug` é o valor aceito em /passo-a-passo/:tema, `icone` é o nome do
// arquivo em src/assets/icones.
export const pilares = [
  { slug: 'logo', titulo: 'Logo', icone: 'trademark-registered' },
  { slug: 'icone', titulo: 'Ícone', icone: 'smiley' },
  { slug: 'paleta-de-cores', titulo: 'Paleta de Cores', icone: 'palette' },
  { slug: 'tipografia', titulo: 'Tipografia', icone: 'text-aa' },
  { slug: 'fotografia', titulo: 'Fotografia', icone: 'camera' },
  { slug: 'personalidade', titulo: 'Personalidade', icone: 'user-sound' },
  { slug: 'elementos', titulo: 'Elementos', icone: 'file' },
]

export const temas = pilares.map((pilar) => pilar.slug)
