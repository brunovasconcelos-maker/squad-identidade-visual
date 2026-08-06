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

A única exceção é o passo de Tipografia do fluxo, onde a pessoa escolhe a fonte
da marca dela: ali as prévias usam a fonte escolhida. Isso é conteúdo, não
interface — a interface em volta continua toda em Inter.

## Fontes do Google (passo de Tipografia)

O catálogo da busca é local: `src/data/googleFonts.json`, com nome, variantes e
categoria de cada família. É gerado por `scripts/gerar-fontes.mjs` a partir do
pacote `google-font-metadata` (devDependency, ~55 MB) e versionado já compacto,
para o navegador não baixar o pacote inteiro e o build não depender de gerá-lo.
Para atualizar quando o Google publicar fontes novas:

```
npm run fontes:atualizar
```

O carregamento usa o embed público do Google Fonts (`fonts.googleapis.com/css2`),
que dispensa chave de API: `src/lib/googleFonts.js` monta a URL com os pesos
marcados e `src/hooks/useFonteDoGoogle.js` injeta o `<link>`. Quem baixa a fonte
é o navegador de quem visita o site — a rede da sessão do Claude Code não
interfere nisso.

## Design tokens

Cores, tamanhos de texto, pesos, raios e espaçamentos ficam em
`src/styles/tokens.css`, extraídos do Figma. Ao estilizar, use os tokens em
vez de valores literais; se faltar um valor, acrescente um token novo em vez
de espalhar hex pelo CSS.

## Estilos

CSS Modules por componente (`Componente.module.css`). Sem biblioteca de UI e
sem framework de CSS — o design é definido no Figma e traduzido à mão.

## Organização

- `src/pages` — uma página por rota
- `src/components` — componentes compartilhados
- `src/steps` — o conteúdo de cada passo do fluxo `/passo-a-passo`
- `src/hooks` — hooks de estado (ex.: `useFluxo`)
- `src/lib` — lógica sem React (ex.: `cor`, `googleFonts`)
- `src/data` — listas fixas do domínio (ex.: `pilares`, `googleFonts.json`)
- `scripts` — geradores rodados à mão, nunca no build

## Persistência

**Nada é gravado no navegador durante o fluxo.** Uploads, paleta e tipografia
ficam em memória, no estado do componente do fluxo (`useFluxo`, chamado em
`PassoAPasso`). Isso
atravessa a navegação entre passos, mas sair pelo X ou pelo "Voltar" do passo 1
desmonta o componente e descarta tudo — na próxima entrada o fluxo volta vazio,
que é o comportamento esperado.

A gravação de verdade acontecerá só na etapa final de salvar, que ainda não
existe. Não reintroduza escrita por passo (IndexedDB, localStorage ou o que
for) sem que isso seja pedido.

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
