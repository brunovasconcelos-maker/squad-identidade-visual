// Os agentes do Squad que podem receber um Tom de Voz.
//
// A ordem é a do Figma (node 6167:957): a grade do passo 4 do modal tem duas
// colunas de três, preenchidas coluna a coluna — Maky, Fin, Waz à esquerda e
// Pipo, Juri, Opy à direita.
//
// `id` é o que fica guardado no manual e também o prefixo do arquivo em
// src/assets/avatar (`<id>_avatar.png`).
export const AGENTES = [
  { id: 'maky', nome: 'Maky' },
  { id: 'fin', nome: 'Fin' },
  { id: 'waz', nome: 'Waz' },
  { id: 'pipo', nome: 'Pipo' },
  { id: 'juri', nome: 'Juri' },
  { id: 'opy', nome: 'Opy' },
]

export const nomeDoAgente = (id) => AGENTES.find((agente) => agente.id === id)?.nome ?? id
