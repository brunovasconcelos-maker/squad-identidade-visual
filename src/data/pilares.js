// Os sete pilares da identidade visual, na ordem em que aparecem na Home.
// `slug` é o valor aceito em /passo-a-passo/:tema, `icone` é o nome do
// arquivo em src/assets/icones.
export const pilares = [
  { slug: 'logo', titulo: 'Logo', icone: 'Logo' },
  { slug: 'icone', titulo: 'Ícone', icone: 'Icone' },
  { slug: 'paleta-de-cores', titulo: 'Paleta de Cores', icone: 'Paleta' },
  { slug: 'tipografia', titulo: 'Tipografia', icone: 'Tipografia' },
  { slug: 'fotografia', titulo: 'Fotografia', icone: 'Fotografia' },
  { slug: 'personalidade', titulo: 'Personalidade', icone: 'Personalidade' },
  { slug: 'elementos', titulo: 'Elementos', icone: 'Elementos' },
]

export const temas = pilares.map((pilar) => pilar.slug)
