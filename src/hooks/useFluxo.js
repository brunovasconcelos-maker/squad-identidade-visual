import { useCallback, useEffect, useRef, useState } from 'react'
import { comTomAdicional, gerarTons, normalizarHex } from '../lib/cor.js'
import { comVarianteAlternada, MAXIMO_SECUNDARIAS } from '../lib/googleFonts.js'
import { MAXIMO_POR_CATEGORIA, totalDeFotos } from '../data/fotografia.js'
import { posicoesPadrao } from '../data/personalidade.js'

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

function tipografiaVazia() {
  return { primaria: null, secundarias: [] }
}

// `tela` também é estado do fluxo, não da tela: voltando do passo seguinte, a
// Fotografia precisa reabrir no resumo se era ali que a pessoa estava.
function fotografiaVazia() {
  return { selecoes: {}, tela: 'selecao' }
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
 *   {
 *     uploads: { logo: {...}, icone: {...} },
 *     paleta: [ ...cores ],
 *     tipografia: { primaria, secundarias: [ { id, fonte } ] },
 *   }
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
  const [tipografia, setTipografia] = useState(tipografiaVazia)
  const [fotografia, setFotografia] = useState(fotografiaVazia)
  // Nasce preenchida: os cinco eixos já começam no meio.
  const [personalidade, setPersonalidade] = useState(posicoesPadrao)
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

  // Só uma cor por vez pode ser a principal, e ela sobe para o topo da lista.
  // As demais mantêm a ordem relativa que já tinham.
  const marcarPrincipal = useCallback((id) => {
    setPaleta((atual) => {
      const marcadas = atual.map((cor) => ({ ...cor, principal: cor.id === id }))
      const principal = marcadas.find((cor) => cor.principal)
      if (!principal) return marcadas
      return [principal, ...marcadas.filter((cor) => !cor.principal)]
    })
  }, [])

  const adicionarTom = useCallback((id) => {
    setPaleta((atual) =>
      atual.map((cor) => (cor.id === id ? { ...cor, tons: comTomAdicional(cor) } : cor)),
    )
  }, [])

  // O degrau volta a ficar vago e pode ser repreenchido pelo "Adicionar Tom".
  // A âncora é a cor escolhida pela pessoa, então não sai por aqui.
  const removerTom = useCallback((id, passo) => {
    setPaleta((atual) =>
      atual.map((cor) =>
        cor.id === id
          ? { ...cor, tons: cor.tons.filter((tom) => tom.ancora || tom.passo !== passo) }
          : cor,
      ),
    )
  }, [])

  // Tipografia. O card primário é único; os secundários são vagas numeradas,
  // até três. `alvo` é 'primaria' ou o id da vaga secundária.
  const definirFonte = useCallback((alvo, fonte) => {
    setTipografia((atual) =>
      alvo === 'primaria'
        ? { ...atual, primaria: fonte }
        : {
            ...atual,
            secundarias: atual.secundarias.map((vaga) =>
              vaga.id === alvo ? { ...vaga, fonte } : vaga,
            ),
          },
    )
  }, [])

  // A lixeira: na primária volta ao estado vazio, na secundária tira o card e
  // libera a vaga para o "Adicionar".
  const removerFonte = useCallback((alvo) => {
    setTipografia((atual) =>
      alvo === 'primaria'
        ? { ...atual, primaria: null }
        : { ...atual, secundarias: atual.secundarias.filter((vaga) => vaga.id !== alvo) },
    )
  }, [])

  // Uma vaga por vez: só entra outra depois que a atual recebeu uma fonte.
  const adicionarSecundaria = useCallback(() => {
    setTipografia((atual) =>
      atual.secundarias.length >= MAXIMO_SECUNDARIAS ||
      atual.secundarias.some((vaga) => !vaga.fonte)
        ? atual
        : {
            ...atual,
            secundarias: [...atual.secundarias, { id: crypto.randomUUID(), fonte: null }],
          },
    )
  }, [])

  const alternarVariante = useCallback((alvo, chave) => {
    setTipografia((atual) =>
      alvo === 'primaria'
        ? { ...atual, primaria: comVarianteAlternada(atual.primaria, chave) }
        : {
            ...atual,
            secundarias: atual.secundarias.map((vaga) =>
              vaga.id === alvo ? { ...vaga, fonte: comVarianteAlternada(vaga.fonte, chave) } : vaga,
            ),
          },
    )
  }, [])

  // Fotografia. As escolhas ficam por categoria, e trocar de aba não mexe nas
  // outras — cada categoria guarda a sua própria lista.
  const alternarFoto = useCallback((categoria, numero) => {
    setFotografia((atual) => {
      const escolhidas = atual.selecoes[categoria] ?? []
      const jaEscolhida = escolhidas.includes(numero)

      // Cheia: clicar numa quarta foto não faz nada. Devolver o mesmo objeto
      // evita a re-renderização.
      if (!jaEscolhida && escolhidas.length >= MAXIMO_POR_CATEGORIA) return atual

      const proximas = jaEscolhida
        ? escolhidas.filter((n) => n !== numero)
        : [...escolhidas, numero]

      const selecoes = { ...atual.selecoes, [categoria]: proximas }

      // Tirando a última foto pelo resumo não sobra o que resumir.
      const tela = atual.tela === 'resumo' && totalDeFotos(selecoes) === 0 ? 'selecao' : atual.tela

      return { selecoes, tela }
    })
  }, [])

  const irParaTelaDaFotografia = useCallback((tela) => {
    setFotografia((atual) => (atual.tela === tela ? atual : { ...atual, tela }))
  }, [])

  const definirPosicao = useCallback((eixo, valor) => {
    setPersonalidade((atual) => (atual[eixo] === valor ? atual : { ...atual, [eixo]: valor }))
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
      removerTom,
    },
    tipografia,
    acoesDaTipografia: {
      definirFonte,
      removerFonte,
      adicionarSecundaria,
      alternarVariante,
    },
    fotografia,
    acoesDaFotografia: {
      alternarFoto,
      irParaTela: irParaTelaDaFotografia,
    },
    personalidade,
    acoesDaPersonalidade: { definirPosicao },
  }
}
