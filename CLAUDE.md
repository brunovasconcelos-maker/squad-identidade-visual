# Squad — Identidade Visual

Prova de conceito de um novo pilar do produto Squad. Site standalone em
React + Vite, publicado no GitHub Pages.

## Tipografia — regra fixa

**Todo o site usa Inter.** Títulos, corpo de texto, botões, legendas: tudo.
Vale para todas as páginas, inclusive as que ainda serão criadas. Não
introduza outra família de fonte sem que isso seja pedido explicitamente.

A fonte é servida localmente por `@fontsource/inter` (sem CDN), importada em
`src/index.css`, e exposta como `--fonte` em `src/styles/tokens.css`. Use
sempre o token — nunca escreva `font-family` com um nome de fonte solto.

## Design tokens

Cores, tamanhos de texto, pesos, raios e espaçamentos ficam em
`src/styles/tokens.css`, extraídos do Figma. Ao estilizar, use os tokens em
vez de valores literais; se faltar um valor, acrescente um token novo em vez
de espalhar hex pelo CSS.

## Estilos

CSS Modules por componente (`Componente.module.css`). Sem biblioteca de UI e
sem framework de CSS — o design é definido no Figma e traduzido à mão.

## Assets

Ícones em `src/assets/icones`, imagens em `src/assets/imagens`.

Os ícones são inline via `src/components/Icon.jsx`, que lê os SVGs como texto
e os injeta para que `currentColor` funcione. SVGs exportados do Figma vêm com
`fill="black"` fixo; `Icon.module.css` normaliza isso para `currentColor`, então
a cor vem do CSS do elemento pai — não edite os arquivos de asset para mudar cor.

**Importante:** a política de rede das sessões do Claude Code bloqueia
`www.figma.com`. O agente lê layout, medidas e cores pelo Figma MCP, mas não
consegue baixar imagens nem SVGs. Assets novos precisam ser exportados e
commitados à mão.

## Deploy

Push na `main` dispara `.github/workflows/deploy.yml`, que publica no GitHub
Pages. O ambiente `github-pages` só aceita deploy da branch padrão, então
mudanças precisam chegar na `main` para irem ao ar.

`vite.config.js` define `base: '/squad-identidade-visual/'` em produção; se o
repositório for renomeado, atualize esse valor.
