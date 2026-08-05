import { useCallback, useEffect, useRef, useState } from 'react'

export const TIPOS_ARQUIVO = ['principal', 'preta', 'branca']

// Passos que recebem upload. Os demais entram aqui conforme forem construídos.
export const PASSOS_COM_UPLOAD = ['logo', 'icone']

function estadoVazio() {
  return Object.fromEntries(
    PASSOS_COM_UPLOAD.map((passo) => [
      passo,
      Object.fromEntries(TIPOS_ARQUIVO.map((tipo) => [tipo, null])),
    ]),
  )
}

/**
 * Estado dos uploads do fluxo inteiro, só em memória, num único objeto:
 *
 *   { logo: { principal, preta, branca }, icone: { ... } }
 *
 * Ficar num objeto só, no componente do fluxo, é o que faz ir e voltar entre
 * passos não perder nada: o estado não pertence a passo nenhum. Sair pelo X ou
 * pelo "Voltar" do passo 1 desmonta o fluxo e tudo é descartado — na próxima
 * entrada volta vazio.
 *
 * A gravação de verdade entra depois, na etapa final de salvar.
 */
export default function useUploads() {
  const [uploads, setUploads] = useState(estadoVazio)
  const urls = useRef(new Set())

  const salvar = useCallback((passo, tipo, arquivo) => {
    const url = URL.createObjectURL(arquivo)
    urls.current.add(url)

    setUploads((atual) => {
      const anterior = atual[passo]?.[tipo]?.url
      if (anterior) {
        URL.revokeObjectURL(anterior)
        urls.current.delete(anterior)
      }

      return {
        ...atual,
        [passo]: { ...atual[passo], [tipo]: { url, nome: arquivo.name } },
      }
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

  return { uploads, salvar }
}
