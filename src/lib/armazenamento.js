/*
 * Gravação do manual no IndexedDB.
 *
 * Só a etapa final de salvar escreve aqui — durante o fluxo nada é gravado.
 * O manual inteiro é um registro só, sobrescrito a cada finalização.
 *
 * O que vai para o disco são os Blobs dos arquivos, nunca as object URLs:
 * elas valem só enquanto a aba está aberta, e voltariam quebradas na próxima
 * visita. Quem lê recria as URLs a partir dos Blobs (ver `comUrls`).
 */
const BANCO = 'squad-identidade-visual'
const DEPOSITO = 'manual'
const CHAVE = 'atual'
const VERSAO = 1

function abrir() {
  return new Promise((resolve, reject) => {
    const pedido = indexedDB.open(BANCO, VERSAO)

    pedido.onupgradeneeded = () => {
      const bd = pedido.result
      if (!bd.objectStoreNames.contains(DEPOSITO)) bd.createObjectStore(DEPOSITO)
    }

    pedido.onsuccess = () => resolve(pedido.result)
    pedido.onerror = () => reject(pedido.error)
  })
}

function transacao(bd, modo, executar) {
  return new Promise((resolve, reject) => {
    const tx = bd.transaction(DEPOSITO, modo)
    const pedido = executar(tx.objectStore(DEPOSITO))
    tx.oncomplete = () => resolve(pedido?.result)
    tx.onerror = () => reject(tx.error)
    tx.onabort = () => reject(tx.error)
  })
}

/** Grava o manual inteiro, substituindo o que estivesse lá. */
export async function salvarManual(manual) {
  const bd = await abrir()
  try {
    await transacao(bd, 'readwrite', (deposito) =>
      deposito.put({ ...manual, salvoEm: new Date().toISOString() }, CHAVE),
    )
  } finally {
    bd.close()
  }
}

/** Devolve o manual gravado, ou null se ainda não houver nenhum. */
export async function lerManual() {
  const bd = await abrir()
  try {
    return (await transacao(bd, 'readonly', (deposito) => deposito.get(CHAVE))) ?? null
  } finally {
    bd.close()
  }
}

/** Apaga tudo. Usado pelo "Reiniciar manual da marca". */
export async function apagarManual() {
  const bd = await abrir()
  try {
    await transacao(bd, 'readwrite', (deposito) => deposito.delete(CHAVE))
  } finally {
    bd.close()
  }
}
