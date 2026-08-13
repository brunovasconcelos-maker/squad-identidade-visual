import { useCallback, useEffect, useRef, useState } from 'react'
import { apagarManual, lerManual } from '../lib/armazenamento.js'
import { deArmazenamento } from '../lib/manual.js'

/**
 * Lê o manual gravado para a Home mostrar o que já foi preenchido.
 *
 * As object URLs das prévias são recriadas aqui e liberadas quando a Home sai
 * de cena ou quando o manual é relido, para não vazar a cada leitura.
 */
export default function useManual() {
  const [manual, setManual] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const urls = useRef(new Set())

  const liberarUrls = useCallback(() => {
    urls.current.forEach(URL.revokeObjectURL)
    urls.current.clear()
  }, [])

  const carregar = useCallback(async () => {
    setCarregando(true)
    try {
      const salvo = await lerManual()
      liberarUrls()
      const lido = deArmazenamento(salvo)

      if (lido) {
        Object.values(lido.uploads).forEach((porTipo) =>
          Object.values(porTipo).forEach((registro) => {
            if (registro?.url) urls.current.add(registro.url)
          }),
        )
        lido.elementos.forEach((elemento) => {
          if (elemento.arquivo?.url) urls.current.add(elemento.arquivo.url)
        })
        lido.variacoesDaLogo.forEach((variacao) => {
          if (variacao.arquivo?.url) urls.current.add(variacao.arquivo.url)
        })
      }

      setManual(lido)
    } catch (erro) {
      console.error('Não foi possível ler o manual salvo.', erro)
      setManual(null)
    } finally {
      setCarregando(false)
    }
  }, [liberarUrls])

  const reiniciar = useCallback(async () => {
    await apagarManual()
    liberarUrls()
    setManual(null)
  }, [liberarUrls])

  useEffect(() => {
    carregar()
    return liberarUrls
  }, [carregar, liberarUrls])

  return { manual, carregando, reiniciar }
}
