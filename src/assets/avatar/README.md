# Avatares

Avatares dos agentes do Squad, para a página de Tom de Voz.

Um arquivo por personagem, nomeado com o nome do agente:

- `Waz`
- `Maky`
- `Fin`
- `Pipo`
- `Juri`
- `Opy`

A pasta está vazia de propósito — os arquivos ainda não foram enviados, e
nenhum código referencia esta pasta por enquanto.

## Ao subir os arquivos

- **Maiúsculas importam.** O GitHub Pages diferencia maiúsculas de minúsculas,
  então `Waz.png` e `waz.png` são arquivos diferentes. Um nome errado só quebra
  em produção, nunca no `npm run dev` — vale conferir na hora de subir.
- Mantenha uma extensão só para todos, para o carregamento por
  `import.meta.glob` ficar simples (as demais pastas usam `.png` e `.svg`).
- Este `README.md` é o que faz o Git rastrear a pasta enquanto ela está vazia.
  Pode ficar depois que os avatares chegarem.

## Sobre extrair assets do Figma

A política de rede das sessões do Claude Code bloqueia o host `www.figma.com`,
então o agente **não consegue baixar assets** do arquivo, mesmo lendo layout,
medidas e cores pelo MCP. Os avatares precisam ser exportados e commitados à
mão.
