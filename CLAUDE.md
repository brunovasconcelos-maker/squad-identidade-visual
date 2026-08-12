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

**Existe uma gravação só, no fim.** Durante o fluxo tudo vive em memória, no
estado de `useFluxo` (chamado em `PassoAPasso`): uploads, paleta, tipografia,
fotografia, personalidade e elementos. Isso atravessa a navegação entre passos,
mas sair pelo X ou pelo "Voltar" do passo 1 descarta o que ainda não foi
finalizado.

O "Finalizar" do último passo grava o manual inteiro no IndexedDB de uma vez
(`src/lib/armazenamento.js`, um registro só, sobrescrito a cada finalização).
**Não reintroduza escrita por passo** — nem IndexedDB, nem localStorage — sem
que isso seja pedido.

Ao entrar, o fluxo **lê** o manual salvo e hidrata o estado com ele. Sem isso,
continuar de onde parou apagaria os temas já preenchidos na finalização
seguinte, porque a gravação substitui o registro inteiro.

O que vai para o disco são os Blobs dos arquivos, nunca as object URLs: elas
morrem com a aba. `src/lib/manual.js` converte entre as duas formas e recria as
URLs na leitura; quem lê é responsável por liberá-las.

## Pilares — uma lista só

`src/data/pilares.js` é a única fonte da ordem e da quantidade de temas. Dela
saem o total de passos do fluxo, a barra de progresso, o percentual da Home,
os cards e os temas aceitos em `/passo-a-passo/:tema`. Acrescentar ou reordenar
um tema é mexer só nessa lista — não há contagem escrita à mão em lugar nenhum.

Um tema sem modelo de dados (hoje o Tom de Voz) simplesmente não declara nada
em `conteudoDoPilar`, e com isso nunca conta como preenchido: o "Continuar"
dele fica desabilitado e 100% fica inalcançável até o passo ser construído.

## Barra inferior — regra fixa

**"Não tenho, pular" e "Continuar" nunca ficam ativos ao mesmo tempo.** Com o
passo vazio, "Continuar" está desabilitado e o pular aparece; assim que o passo
tem conteúdo, o pular **some da tela** — não fica desabilitado, some. Vale para
todos os passos, inclusive os que ainda serão criados.

Na prática é `mostrarPular = !temConteudo` em `PassoAPasso`: uma expressão só,
nunca caso a caso por passo. Passo novo só precisa declarar o que conta como
conteúdo dele em `conteudoDoPilar`, e a regra vem junto.

## Passos com mais de uma tela

Um passo do fluxo pode ter telas internas. A Fotografia tem duas (seleção e
resumo): a tela atual vive no estado do fluxo, não no componente, porque voltar
do passo seguinte precisa cair de novo onde a pessoa estava. A barra de
progresso só anda quando `passo` muda — trocar de tela interna não mexe nela.

O Tom de Voz é diferente: os quatro passos dele são um modal, não telas do
fluxo. Enquanto o modal está aberto o passo por baixo não muda, e o que foi
digitado só vira dado no "Finalizar" — fechar descarta tudo.

## Tom de Voz — um agente, um tom

**Cada agente do Squad pertence a um Tom de Voz só.** Na atribuição, um agente
já usado por outro tom aparece desabilitado, nunca só desmarcado. A conta sai
da própria lista de tons (`tons.flatMap((tom) => tom.agentes)`), então excluir
um tom devolve os agentes dele sozinho — não há nada para limpar à parte.

Numa edição, os agentes do próprio tom continuam selecionáveis; só os dos
outros ficam bloqueados.

## Assets

Ícones em `src/assets/icones`, imagens em `src/assets/imagens`, avatares dos
agentes do Squad em `src/assets/avatar` (`<id>_avatar.png`, resolvidos por
`src/lib/avatares.js`).

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

## Luminância das fotos

`src/data/luminanciaDasFotos.json` guarda o brilho médio do miolo de cada
imagem de `src/assets/imagens`. A página do Logo usa esse número para escolher
a foto que dá mais contraste com a logo de cor única, sem precisar decodificar
54 PNGs no navegador. É gerado por `scripts/gerar-luminancia.mjs` (decodificador
de PNG próprio, sem dependência nova) e versionado:

```
npm run fotos:luminancia
```

Só precisa rodar de novo se as fotos mudarem.
