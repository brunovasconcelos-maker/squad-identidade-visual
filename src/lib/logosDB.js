/*
 * Persistência dos logos no IndexedDB.
 *
 * Arquivos podem passar do limite do localStorage, e o IndexedDB guarda
 * Blob/File direto, sem precisar converter para base64.
 *
 * É armazenamento local do navegador: não sincroniza entre dispositivos nem
 * vai para o GitHub. Por enquanto é o esperado.
 */

const NOME_BANCO = 'squad-identidade-visual'
const NOME_STORE = 'logos'
const VERSAO = 1

export const TIPOS_LOGO = ['principal', 'preta', 'branca']

function abrirBanco() {
  return new Promise((resolve, reject) => {
    const requisicao = indexedDB.open(NOME_BANCO, VERSAO)

    requisicao.onupgradeneeded = () => {
      const banco = requisicao.result
      if (!banco.objectStoreNames.contains(NOME_STORE)) {
        banco.createObjectStore(NOME_STORE)
      }
    }

    requisicao.onsuccess = () => resolve(requisicao.result)
    requisicao.onerror = () => reject(requisicao.error)
  })
}

async function comStore(modo, operacao) {
  const banco = await abrirBanco()

  try {
    return await new Promise((resolve, reject) => {
      const transacao = banco.transaction(NOME_STORE, modo)
      const requisicao = operacao(transacao.objectStore(NOME_STORE))

      transacao.oncomplete = () => resolve(requisicao?.result)
      transacao.onerror = () => reject(transacao.error)
      transacao.onabort = () => reject(transacao.error)
    })
  } finally {
    banco.close()
  }
}

export function salvarLogo(tipo, arquivo) {
  return comStore('readwrite', (store) =>
    store.put({ arquivo, nome: arquivo.name, tipoMime: arquivo.type, salvoEm: Date.now() }, tipo),
  )
}

export function lerLogo(tipo) {
  return comStore('readonly', (store) => store.get(tipo))
}

export function removerLogo(tipo) {
  return comStore('readwrite', (store) => store.delete(tipo))
}

export async function lerTodosLogos() {
  const entradas = await Promise.all(
    TIPOS_LOGO.map(async (tipo) => [tipo, await lerLogo(tipo)]),
  )
  return Object.fromEntries(entradas)
}
