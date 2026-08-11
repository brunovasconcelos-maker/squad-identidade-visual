// Os oito pilares da identidade visual, na ordem em que aparecem na Home e no
// passo a passo. Esta lista é a única fonte da ordem e da quantidade: o total
// de passos, a barra de progresso, o percentual da Home e os temas aceitos em
// /passo-a-passo/:tema todos derivam dela.
//
// `slug` é o valor aceito na rota, `icone` é o nome do arquivo em
// src/assets/icones.
export const pilares = [
  { slug: 'logo', titulo: 'Logo', icone: 'Logo' },
  { slug: 'icone', titulo: 'Ícone', icone: 'Star-Filled' },
  { slug: 'paleta-de-cores', titulo: 'Paleta de Cores', icone: 'Paleta' },
  { slug: 'tipografia', titulo: 'Tipografia', icone: 'Tipografia' },
  // Personalidade.svg é o rosto com as ondas de som — o glifo do Figma para
  // este tema, apesar do nome do arquivo.
  { slug: 'tom-de-voz', titulo: 'Tom de Voz', icone: 'Personalidade' },
  { slug: 'fotografia', titulo: 'Fotografia', icone: 'Fotografia' },
  // O rosto de Icone.svg é o ícone da Personalidade; o Ícone ficou com a
  // estrela sólida. Os nomes dos arquivos não acompanharam a troca de propósito.
  { slug: 'personalidade', titulo: 'Personalidade', icone: 'Icone' },
  { slug: 'elementos', titulo: 'Elementos', icone: 'Elementos' },
]

export const temas = pilares.map((pilar) => pilar.slug)
