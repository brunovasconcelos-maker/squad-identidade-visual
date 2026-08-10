/*
 * Formato dos passos que recebem arquivo.
 *
 * Fica aqui, e não no useFluxo, porque a gravação (src/lib/manual.js) também
 * precisa dessas listas — e um lib importando um hook daria ciclo.
 */
export const TIPOS_ARQUIVO = ['principal', 'preta', 'branca']

// Passos que recebem upload. Os demais entram aqui conforme forem construídos.
export const PASSOS_COM_UPLOAD = ['logo', 'icone']
