import { useCallback, useEffect, useRef, useState } from 'react'
import { lerTodosLogos, salvarLogo, TIPOS_LOGO } from '../lib/logosDB.js'

const NENHUM = Object.fromEntries(TIPOS_LOGO.map((tipo) => [tipo, null]))

/**
 * Lê os logos salvos no IndexedDB na montagem e expõe `salvar` para gravar
 * novos. Cada logo vira { url, nome }, com a url pronta para o <img>.
 */
export default function useLogos() {
  const [logos, setLogos] = useState(NENHUM)
  const [carregando, setCarregando] = useState(true)
  const urls = useRef(new Set())

  const criarUrl = useCallback((arquivo) => {
    const url = URL.createObjectURL(arquivo)
    urls.current.add(url)
    return url
  }, [])

  useEffect(() => {
    let ativo = true

    lerTodosLogos()
      .then((registros) => {
        if (!ativo) return
        setLogos(
          Object.fromEntries(
            TIPOS_LOGO.map((tipo) => {
              const registro = registros[tipo]
              return [
                tipo,
                registro ? { url: criarUrl(registro.arquivo), nome: registro.nome } : null,
              ]
            }),
          ),
        )
      })
      .catch((erro) => {
        console.error('Não foi possível ler os logos salvos.', erro)
      })
      .finally(() => {
        if (ativo) setCarregando(false)
      })

    return () => {
      ativo = false
    }
    // As object URLs só são revogadas quando o logo é trocado. Revogar na
    // desmontagem quebraria as imagens no remount do StrictMode, e são três
    // URLs no máximo — o navegador libera tudo ao sair da página.
  }, [criarUrl])

  const salvar = useCallback(
    async (tipo, arquivo) => {
      await salvarLogo(tipo, arquivo)
      const url = criarUrl(arquivo)

      setLogos((atual) => {
        const anterior = atual[tipo]?.url
        if (anterior) {
          URL.revokeObjectURL(anterior)
          urls.current.delete(anterior)
        }
        return { ...atual, [tipo]: { url, nome: arquivo.name } }
      })
    },
    [criarUrl],
  )

  return { logos, carregando, salvar }
}
