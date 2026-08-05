# Imagens

## `tom.svg` — placeholder, precisa ser substituído

A ilustração do Tom (o mascote em forma de paleta que aparece no banner da Home)
**não pôde ser extraída do Figma automaticamente**: a política de rede desta
sessão bloqueia o host `www.figma.com`, então nem o download direto do asset nem
o `WebFetch` conseguiram baixar os bytes. O que está aqui hoje é um placeholder
desenhado à mão, com a geometria certa mas sem a arte.

Para colocar a arte real:

1. No Figma, abra `Squad | Identidade Visual` e selecione o node `6075:5312`
   (dentro do banner, `Frame 2147223806`).
2. Exporte como **PNG 3x** — a arte ocupa 107×128 px no layout.
3. Salve como `tom.png` nesta pasta.
4. Em `src/components/Banner.jsx`, troque a linha do import:

   ```diff
   -import tom from '../assets/imagens/tom.svg'
   +import tom from '../assets/imagens/tom.png'
   ```

Não é preciso mexer no CSS: `src/components/Banner.module.css` já fixa a caixa
em 107×128 px, centralizada no slot de 80×80 px e transbordando o banner, como
no Figma.
