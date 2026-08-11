// Os oito pilares da identidade visual, na ordem em que aparecem na Home e no
// passo a passo. Esta lista é a única fonte da ordem e da quantidade: o total
// de passos, a barra de progresso, o percentual da Home e os temas aceitos em
// /passo-a-passo/:tema todos derivam dela.
//
// `slug` é o valor aceito na rota, `icone` é o nome do arquivo em
// src/assets/icones.
export const pilares = [
  { slug: 'logo', titulo: 'Logo', icone: 'Logo' },
  { slug: 'icone', titulo: 'Ícone', icone: 'Icone' },
  { slug: 'paleta-de-cores', titulo: 'Paleta de Cores', icone: 'Paleta' },
  { slug: 'tipografia', titulo: 'Tipografia', icone: 'Tipografia' },
  // O passo já funciona e o que é criado nele vai para o manual salvo, mas a
  // Home ainda não lê esse pedaço: o tema nunca conta como preenchido, então
  // 100% só volta a ser possível quando o card da Home for construído.
  // O ícone é emprestado da Personalidade até ter o próprio.
  { slug: 'tom-de-voz', titulo: 'Tom de Voz', icone: 'Personalidade' },
  { slug: 'fotografia', titulo: 'Fotografia', icone: 'Fotografia' },
  { slug: 'personalidade', titulo: 'Personalidade', icone: 'Personalidade' },
  { slug: 'elementos', titulo: 'Elementos', icone: 'Elementos' },
]

export const temas = pilares.map((pilar) => pilar.slug)
