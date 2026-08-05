import { useCallback, useEffect, useRef, useState } from 'react'

export const TIPOS_LOGO = ['principal', 'preta', 'branca']

const NENHUM = Object.fromEntries(TIPOS_LOGO.map((tipo) => [tipo, null]))

/**
 * Estado dos logos do fluxo, só em memória.
 *
 * Nada é gravado no navegador: os uploads vivem enquanto o fluxo estiver
 * aberto e atravessam a navegação entre passos, porque o estado fica no
 * componente do fluxo. Sair pelo X ou pelo "Voltar" do passo 1 desmonta esse
 * componente e os uploads somem — na próxima entrada tudo volta vazio.
 *
 * A gravação de verdade entra depois, na etapa final de salvar.
 */
export default function useLogos() {
  const [logos, setLogos] = useState(NENHUM)
  const urls = useRef(new Set())

  const salvar = useCallback((tipo, arquivo) => {
    const url = URL.createObjectURL(arquivo)
    urls.current.add(url)

    setLogos((atual) => {
      const anterior = atual[tipo]?.url
      if (anterior) {
        URL.revokeObjectURL(anterior)
        urls.current.delete(anterior)
      }
      return { ...atual, [tipo]: { url, nome: arquivo.name } }
    })
  }, [])

  // Ao sair do fluxo, libera as object URLs criadas.
  useEffect(() => {
    const criadas = urls.current
    return () => {
      criadas.forEach(URL.revokeObjectURL)
      criadas.clear()
    }
  }, [])

  return { logos, salvar }
}
