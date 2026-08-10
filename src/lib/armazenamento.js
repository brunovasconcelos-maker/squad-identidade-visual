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
/*
 * Versão 2 porque a 1 podia existir sem o depósito.
 *
 * `indexedDB.open(nome)` sem versão, num banco que ainda não existe, cria a
 * versão 1 e dispara o onupgradeneeded sem ninguém criar depósito nenhum — e
 * fica um banco v1 vazio. Depois disso, abrir na v1 casa com a versão que já
 * está lá, o onupgradeneeded não roda mais, e todo `transaction('manual')`
 * falha com "One of the specified object stores was not found", para sempre.
 * Subir a versão faz o onupgradeneeded rodar e criar o depósito que faltava.
 */
const VERSAO = 2

function abrirNaVersao(versao) {
  return new Promise((resolve, reject) => {
    // Sem versão o navegador abre a que existir, que é o que queremos quando
    // só precisamos descobrir em que pé o banco está.
    const pedido = versao === undefined ? indexedDB.open(BANCO) : indexedDB.open(BANCO, versao)

    pedido.onupgradeneeded = () => {
      const bd = pedido.result
      if (!bd.objectStoreNames.contains(DEPOSITO)) bd.createObjectStore(DEPOSITO)
    }

    pedido.onsuccess = () => resolve(pedido.result)
    pedido.onerror = () => reject(pedido.error)
    // Outra aba segurando uma versão antiga travaria a abertura para sempre.
    pedido.onblocked = () =>
      reject(new Error('O manual está aberto em outra aba. Feche as outras abas e tente de novo.'))
  })
}

/**
 * Abre o banco garantindo que o depósito existe.
 *
 * Só subir a versão resolve quem está atrás dela. Se o banco já estiver numa
 * versão igual ou maior e ainda assim sem o depósito, a única saída é subir de
 * novo a partir da versão real — daí a segunda tentativa.
 */
async function abrir() {
  let bd

  try {
    bd = await abrirNaVersao(VERSAO)
  } catch (erro) {
    // O banco está numa versão mais nova que a nossa constante: abrir na dele.
    if (erro?.name !== 'VersionError') throw erro
    bd = await abrirNaVersao(undefined)
  }

  if (bd.objectStoreNames.contains(DEPOSITO)) return bd

  const proxima = bd.version + 1
  bd.close()
  bd = await abrirNaVersao(proxima)

  if (!bd.objectStoreNames.contains(DEPOSITO)) {
    bd.close()
    throw new Error(`Não foi possível criar o depósito "${DEPOSITO}" no banco do manual.`)
  }

  return bd
}

function transacao(bd, modo, executar) {
  return new Promise((resolve, reject) => {
    const tx = bd.transaction(DEPOSITO, modo)
    let pedido
    // `put` lança na hora quando o valor não é clonável, antes de qualquer
    // evento da transação — por isso o try aqui e não só o onerror.
    try {
      pedido = executar(tx.objectStore(DEPOSITO))
    } catch (erro) {
      tx.abort()
      reject(erro)
      return
    }
    tx.oncomplete = () => resolve(pedido?.result)
    tx.onerror = () => reject(tx.error)
    tx.onabort = () => reject(tx.error)
  })
}

/**
 * Caminho do primeiro valor que o structuredClone recusa.
 *
 * Sem isso um DataCloneError diz só "could not be cloned", sem apontar onde —
 * inútil para consertar. Só roda quando a gravação já falhou.
 */
function ondeNaoClona(valor, caminho = 'manual') {
  try {
    structuredClone(valor)
    return null
  } catch {
    if (valor && typeof valor === 'object') {
      for (const [chave, filho] of Object.entries(valor)) {
        const achado = ondeNaoClona(filho, `${caminho}.${chave}`)
        if (achado) return achado
      }
    }
    return `${caminho} (${valor === null ? 'null' : typeof valor})`
  }
}

function comMensagemUtil(erro, manual) {
  if (erro?.name === 'QuotaExceededError') {
    return new Error(
      'Não há espaço suficiente no navegador para guardar os arquivos deste manual. ' +
        'Remova alguns arquivos ou libere espaço e tente de novo.',
      { cause: erro },
    )
  }

  if (erro?.name === 'DataCloneError') {
    const onde = ondeNaoClona(manual)
    return new Error(
      `Um dos dados do manual não pôde ser gravado${onde ? ` (${onde})` : ''}.`,
      { cause: erro },
    )
  }

  return erro
}

/** Grava o manual inteiro, substituindo o que estivesse lá. */
export async function salvarManual(manual) {
  const registro = { ...manual, salvoEm: new Date().toISOString() }
  const bd = await abrir()

  try {
    await transacao(bd, 'readwrite', (deposito) => deposito.put(registro, CHAVE))
  } catch (erro) {
    throw comMensagemUtil(erro, registro)
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
