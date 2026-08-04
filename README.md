# Squad — Identidade Visual

Prova de conceito de um novo pilar do produto Squad. Por enquanto é um site
standalone, ainda não integrado ao produto principal.

Stack: React + Vite + react-router-dom. Sem biblioteca de UI ou design system —
o design visual será definido depois; o CSS atual é só o mínimo para navegar.

## Rodando localmente

```bash
npm install
npm run dev      # http://localhost:5173
```

Outros scripts:

- `npm run build` — gera `dist/` já com o base path do GitHub Pages
- `npm run preview` — serve o build em `http://localhost:4173/squad-identidade-visual/`
- `npm run deploy` — build + publish manual na branch `gh-pages` (alternativa ao workflow)

## Rotas

| Rota | Página |
| --- | --- |
| `/` | Home |
| `/logo` | Logo |
| `/icone` | Icone |
| `/paleta-de-cores` | PaletaDeCores |
| `/tipografia` | Tipografia |
| `/fotografia` | Fotografia |
| `/personalidade` | Personalidade |
| `/elementos` | Elementos |
| `/passo-a-passo` | PassoAPasso (fluxo completo) |
| `/passo-a-passo/:tema` | PassoAPasso (fluxo de um tema) |

`:tema` aceita `logo`, `icone`, `paleta-de-cores`, `tipografia`, `fotografia`,
`personalidade` e `elementos` — a lista fica em `src/routes.jsx`.

## Estrutura

```
src/
  pages/        uma página por rota (placeholders por enquanto)
  components/   componentes compartilhados
  assets/
    icones/
    imagens/
  routes.jsx    definição das rotas + lista de temas + links da navegação
  App.jsx       layout base (header + nav)
  main.jsx      entrypoint, BrowserRouter com basename
```

## Deploy (GitHub Pages)

O workflow `.github/workflows/deploy.yml` builda e publica a cada push na `main`.
Antes do primeiro deploy, em **Settings → Pages**, defina **Source: GitHub Actions**.

Dois detalhes que fazem o Pages funcionar:

- `vite.config.js` usa `base: '/squad-identidade-visual/'` em produção (em dev fica `/`).
  Se o repositório for renomeado, atualize esse valor.
- O build copia `index.html` para `404.html`, porque o Pages não tem fallback de
  SPA — sem isso, acessar `/logo` direto pela URL devolveria 404.

O site fica em `https://<usuario>.github.io/squad-identidade-visual/`.
