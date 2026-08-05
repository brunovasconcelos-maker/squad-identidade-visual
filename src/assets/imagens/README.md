# Imagens

## `Tom-Home.png`

Ilustração do Tom (o mascote em forma de paleta) usada no banner da Home.
Exportada do Figma em 4x — 428×512 px para uma caixa de 107×128 px no layout,
que é a geometria do node `6075:5312`.

`src/components/Banner.module.css` fixa a caixa em 107×128 px, centralizada num
slot de 80×80 px e transbordando o banner em cima e embaixo, como no Figma.

## Sobre extrair assets do Figma

A política de rede das sessões do Claude Code bloqueia o host `www.figma.com`,
então o agente **não consegue baixar assets** (imagens ou SVGs) do arquivo,
mesmo tendo acesso ao Figma via MCP para ler layout, medidas e cores.

Na prática: qualquer imagem ou SVG novo precisa ser exportado do Figma e
commitado à mão. Specs de layout e estilo o agente consegue ler sozinho.

## Demais imagens

Os arquivos `Retrato-*`, `Product-*`, `Life-Style-*`, `Illustration-*`,
`Ambiente-*`, `3D-*` e os de personalidade (`Minimalista`, `Moderna`,
`Vibrante`, `Sobria`, `Seria`, `Angulosa`, `Arredondada`, `Classica`,
`Descontraida`, `Expressiva`) ainda não são usados — são material para as
páginas de Fotografia e Personalidade.
