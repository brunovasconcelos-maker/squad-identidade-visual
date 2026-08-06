import { useEffect } from 'react'

/*
 * Carrega uma fonte do Google injetando o <link> do embed público
 * (fonts.googleapis.com/css2) no <head>. É o método padrão, sem chave de API:
 * quem baixa a fonte é o navegador de quem visita o site.
 *
 * O registro abaixo conta quantos cards dependem de cada URL, para dois cards
 * que escolheram a mesma fonte não criarem <link> duplicado nem um remover o
 * do outro.
 */
const registro = new Map()

// Marcar/desmarcar um peso troca a URL inteira. Se o <link> antigo saísse na
// hora, a prévia piscaria na fonte de reserva até o novo chegar; esperar um
// pouco cobre a troca, já que o novo CSS costuma carregar bem antes disso.
const ESPERA_ATE_REMOVER = 3000

function adquirir(url) {
  const existente = registro.get(url)

  if (existente) {
    existente.usos += 1
    clearTimeout(existente.remocao)
    existente.remocao = null
    return
  }

  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = url
  document.head.appendChild(link)
  registro.set(url, { link, usos: 1, remocao: null })
}

function liberar(url) {
  const entrada = registro.get(url)
  if (!entrada) return

  entrada.usos -= 1
  if (entrada.usos > 0) return

  entrada.remocao = setTimeout(() => {
    // Pode ter sido readquirido nesse meio tempo.
    if (registro.get(url)?.usos === 0) {
      entrada.link.remove()
      registro.delete(url)
    }
  }, ESPERA_ATE_REMOVER)
}

/** @param {string|null} url URL do css2, ou null quando não há o que carregar. */
export default function useFonteDoGoogle(url) {
  useEffect(() => {
    if (!url) return undefined

    adquirir(url)
    return () => liberar(url)
  }, [url])
}
