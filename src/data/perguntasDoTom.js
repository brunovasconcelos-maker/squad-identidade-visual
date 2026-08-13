/*
 * As perguntas sugeridas do "Pergunte ao Tom", por tema do fluxo.
 *
 * São provisórias: o chat ainda não responde nada, então elas existem para o
 * painel ter conteúdo de verdade em vez de texto de espaço reservado. Quando a
 * conversa passar a funcionar, é aqui que a lista definitiva entra.
 *
 * As chaves são os slugs de src/data/pilares.js — é o mesmo identificador que
 * a rota e o passo usam, então não há segunda lista de nomes para manter.
 */
export const PERGUNTAS = {
  logo: ['O que é um arquivo SVG?', 'Não consigo anexar minha logo', 'Não possuo variações de logo'],
  icone: [
    'O que é um arquivo SVG?',
    'Não consigo anexar meu ícone',
    'Não possuo variações de ícone',
  ],
  'paleta-de-cores': [
    'Como funciona a escala de tons?',
    'Não sei quais cores escolher',
    'Posso adicionar mais de uma cor?',
  ],
  tipografia: ['Como escolher uma fonte?', 'Não encontro minha fonte', 'O que são pesos de fonte?'],
  'tom-de-voz': [
    'O que é um Tom de Voz?',
    'Como escrever boas instruções?',
    'Posso ter mais de um Tom de Voz?',
  ],
  fotografia: [
    'Que tipo de foto devo escolher?',
    'Posso pular essa etapa?',
    'Quantas fotos posso selecionar?',
  ],
  personalidade: ['Como funciona o slider?', 'Preciso preencher todos?', 'Posso pular essa etapa?'],
  elementos: [
    'Que tipos de arquivo posso enviar?',
    'Qual o limite de elementos?',
    'Para que servem os elementos?',
  ],
}

/** As sugestões de um tema, ou nenhuma se o slug não for conhecido. */
export function perguntasDoTema(tema) {
  return PERGUNTAS[tema] ?? []
}
