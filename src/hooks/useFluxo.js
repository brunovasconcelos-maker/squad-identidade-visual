import { useCallback, useEffect, useRef, useState } from 'react'
import { comTomAdicional, gerarTons, normalizarHex } from '../lib/cor.js'

export const TIPOS_ARQUIVO = ['principal', 'preta', 'branca']

// Passos que recebem upload. Os demais entram aqui conforme forem construídos.
export const PASSOS_COM_UPLOAD = ['logo', 'icone']

function uploadsVazios() {
  return Object.fromEntries(
    PASSOS_COM_UPLOAD.map((passo) => [
      passo,
      Object.fromEntries(TIPOS_ARQUIVO.map((tipo) => [tipo, null])),
    ]),
  )
}

function criarCor({ nome, hex }) {
  const hexNormalizado = normalizarHex(hex)

  return {
    id: crypto.randomUUID(),
    // Sem nome, o próprio hex vira o rótulo.
    nome: nome.trim() || hexNormalizado,
    hex: hexNormalizado,
    principal: false,
    tons: gerarTons(hexNormalizado),
  }
}

/**
 * Estado do fluxo inteiro, só em memória: uploads dos passos de arquivo e a
 * paleta de cores, num objeto só.
 *
 *   { uploads: { logo: {...}, icone: {...} }, paleta: [ ...cores ] }
 *
 * Nada é gravado no navegador. Ir e voltar entre passos preserva tudo, porque
 * o estado vive no componente do fluxo; sair pelo X ou pelo "Voltar" do passo 1
 * desmonta esse componente e descarta tudo.
 *
 * A gravação de verdade entra depois, na etapa final de salvar.
 */
export default function useFluxo() {
  const [uploads, setUploads] = useState(uploadsVazios)
  const [paleta, setPaleta] = useState([])
  const urls = useRef(new Set())

  const salvarUpload = useCallback((passo, tipo, arquivo) => {
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

  const adicionarCor = useCallback((dados) => {
    setPaleta((atual) => [...atual, criarCor(dados)])
  }, [])

  // A base pode ter mudado, então a escala é refeita do zero.
  const atualizarCor = useCallback((id, { nome, hex }) => {
    const hexNormalizado = normalizarHex(hex)

    setPaleta((atual) =>
      atual.map((cor) =>
        cor.id === id
          ? {
              ...cor,
              nome: nome.trim() || hexNormalizado,
              hex: hexNormalizado,
              tons: gerarTons(hexNormalizado),
            }
          : cor,
      ),
    )
  }, [])

  const removerCor = useCallback((id) => {
    setPaleta((atual) => atual.filter((cor) => cor.id !== id))
  }, [])

  // Só uma cor por vez pode ser a principal.
  const marcarPrincipal = useCallback((id) => {
    setPaleta((atual) => atual.map((cor) => ({ ...cor, principal: cor.id === id })))
  }, [])

  const adicionarTom = useCallback((id) => {
    setPaleta((atual) =>
      atual.map((cor) => (cor.id === id ? { ...cor, tons: comTomAdicional(cor) } : cor)),
    )
  }, [])

  // Ao sair do fluxo, libera as object URLs criadas.
  useEffect(() => {
    const criadas = urls.current
    return () => {
      criadas.forEach(URL.revokeObjectURL)
      criadas.clear()
    }
  }, [])

  return {
    uploads,
    salvarUpload,
    paleta,
    acoesDaPaleta: {
      adicionar: adicionarCor,
      atualizar: atualizarCor,
      remover: removerCor,
      marcarPrincipal,
      adicionarTom,
    },
  }
}
