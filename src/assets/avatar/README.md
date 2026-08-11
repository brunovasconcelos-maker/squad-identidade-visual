# Avatares

Avatares dos agentes do Squad, usados no passo de Tom de Voz.

Um arquivo por personagem, nomeado `<id>_avatar.png`, com o `id` em minúsculas
como está em `src/data/agentes.js`:

`waz` · `maky` · `fin` · `pipo` · `juri` · `opy`

As imagens já vêm recortadas em círculo e com o degradê de fundo embutido — não
há gradiente nenhum no CSS. Quem resolve os caminhos é `src/lib/avatares.js`,
por `import.meta.glob`.

## Ao trocar ou acrescentar arquivos

- **Maiúsculas importam.** O GitHub Pages diferencia maiúsculas de minúsculas,
  então `Waz_avatar.png` e `waz_avatar.png` são arquivos diferentes. Um nome
  errado só quebra em produção, nunca no `npm run dev` — vale conferir na hora
  de subir.
- Mantenha `.png` para todos, para o `import.meta.glob` continuar simples.
- Um agente novo precisa do arquivo **e** de uma entrada em
  `src/data/agentes.js`; sem o arquivo, o avatar vira imagem quebrada.

## Sobre extrair assets do Figma

A política de rede das sessões do Claude Code bloqueia o host `www.figma.com`,
então o agente **não consegue baixar assets** do arquivo, mesmo lendo layout,
medidas e cores pelo MCP. Os avatares precisam ser exportados e commitados à
mão.
