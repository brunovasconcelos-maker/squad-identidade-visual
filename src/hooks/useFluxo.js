import { useCallback, useEffect, useRef, useState } from 'react'
import { comTomAdicional, gerarTons, normalizarHex } from '../lib/cor.js'
import { comVarianteAlternada, MAXIMO_SECUNDARIAS } from '../lib/googleFonts.js'
import { CATEGORIAS, MAXIMO_POR_CATEGORIA, totalDeFotos } from '../data/fotografia.js'
import { TIPOS_ARQUIVO, PASSOS_COM_UPLOAD } from '../data/uploads.js'
import { lerManual, salvarManual } from '../lib/armazenamento.js'
import {
  comUrl,
  deArmazenamento,
  fatiaDoTema,
  lerArquivo,
  paraArmazenamento,
} from '../lib/manual.js'

export { TIPOS_ARQUIVO, PASSOS_COM_UPLOAD }

export const MAXIMO_DE_ELEMENTOS = 10

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
  return { selecoes: {}, tela: 'selecao', aba: CATEGORIAS[0].id }
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
 * Estado do fluxo inteiro, num objeto só:
 *
 *   {
 *     uploads: { logo: {...}, icone: {...} },
 *     paleta: [ ...cores ],
 *     tipografia: { primaria, secundarias: [ { id, fonte } ] },
 *     tomDeVoz: [ { id, nome, instrucoes, evitar, agentes } ],
 *     fotografia: { selecoes, tela },
 *     personalidade: { [eixo]: 1..5 },  // só os eixos escolhidos
 *     elementos: [ { id, nome, arquivo } ],
 *   }
 *
 * Nada é gravado durante o fluxo: a escrita acontece uma vez só, no
 * `finalizar` do último passo. Na entrada o hook lê o manual já salvo e
 * hidrata o estado com ele, para continuar de onde parou não apagar o que já
 * estava lá. Ir e voltar entre passos preserva tudo, porque o estado vive no
 * componente do fluxo; sair pelo X ou pelo "Voltar" do passo 1 desmonta esse
 * componente e descarta o que ainda não foi finalizado.
 */
export default function useFluxo() {
  const [uploads, setUploads] = useState(uploadsVazios)
  const [paleta, setPaleta] = useState([])
  const [tipografia, setTipografia] = useState(tipografiaVazia)
  const [tomDeVoz, setTomDeVoz] = useState([])
  const [fotografia, setFotografia] = useState(fotografiaVazia)
  // Nasce vazia: eixo sem escolha não tem entrada aqui.
  const [personalidade, setPersonalidade] = useState({})
  const [elementos, setElementos] = useState([])
  // Enquanto lê o que já estava salvo, para não mostrar um fluxo vazio e
  // depois preencher na cara da pessoa.
  const [carregando, setCarregando] = useState(true)
  const urls = useRef(new Set())

  // Os bytes são lidos aqui, na escolha do arquivo, e não na finalização: é o
  // que garante que a gravação no fim não dependa de o arquivo continuar
  // legível no disco. Se a leitura falhar, falha agora, onde dá para repetir.
  const salvarUpload = useCallback(async (passo, tipo, arquivo) => {
    const registro = comUrl(await lerArquivo(arquivo))
    urls.current.add(registro.url)

    setUploads((atual) => {
      const anterior = atual[passo]?.[tipo]?.url
      if (anterior) {
        URL.revokeObjectURL(anterior)
        urls.current.delete(anterior)
      }

      return { ...atual, [passo]: { ...atual[passo], [tipo]: registro } }
    })
  }, [])

  // Esvazia uma moldura só, sem tocar nas outras duas do passo.
  const removerUpload = useCallback((passo, tipo) => {
    setUploads((atual) => {
      const anterior = atual[passo]?.[tipo]?.url
      if (anterior) {
        URL.revokeObjectURL(anterior)
        urls.current.delete(anterior)
      }
      return { ...atual, [passo]: { ...atual[passo], [tipo]: null } }
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

  // Tom de Voz. O modal devolve o tom inteiro, com id: se já existe na lista é
  // edição no lugar, senão entra no fim.
  const salvarTomDeVoz = useCallback((tom) => {
    setTomDeVoz((atual) =>
      atual.some((existente) => existente.id === tom.id)
        ? atual.map((existente) => (existente.id === tom.id ? tom : existente))
        : [...atual, tom],
    )
  }, [])

  // Excluir um tom devolve os agentes dele para os que ainda podem ser
  // atribuídos — a conta é feita a partir da lista, então não há o que limpar.
  const removerTomDeVoz = useCallback((id) => {
    setTomDeVoz((atual) => atual.filter((tom) => tom.id !== id))
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

      // Espalhar o atual, e não montar um objeto novo: senão a aba aberta se
      // perde a cada foto escolhida e o passo volta para a primeira categoria.
      return { ...atual, selecoes, tela }
    })
  }, [])

  const irParaTelaDaFotografia = useCallback((tela) => {
    setFotografia((atual) => (atual.tela === tela ? atual : { ...atual, tela }))
  }, [])

  // A aba aberta é passo de navegação: o "Continuar" da barra inferior anda por
  // ela, então precisa estar aqui e não dentro do componente.
  const irParaAba = useCallback((aba) => {
    setFotografia((atual) => (atual.aba === aba ? atual : { ...atual, aba }))
  }, [])

  const definirPosicao = useCallback((eixo, valor) => {
    setPersonalidade((atual) => (atual[eixo] === valor ? atual : { ...atual, [eixo]: valor }))
  }, [])

  // Elementos. Cada um é um nome dado pela pessoa mais um arquivo.
  const registrarArquivo = useCallback(async (arquivo) => {
    const registro = comUrl(await lerArquivo(arquivo))
    urls.current.add(registro.url)
    return registro
  }, [])

  const adicionarElemento = useCallback(
    async (nome, arquivo) => {
      const registro = await registrarArquivo(arquivo)
      setElementos((atual) =>
        atual.length >= MAXIMO_DE_ELEMENTOS
          ? atual
          : [...atual, { id: crypto.randomUUID(), nome, arquivo: registro }],
      )
    },
    [registrarArquivo],
  )

  // `arquivo` só vem quando a pessoa trocou o arquivo; senão só o nome muda.
  const atualizarElemento = useCallback(
    async (id, nome, arquivo) => {
      const registro = arquivo ? await registrarArquivo(arquivo) : null

      setElementos((atual) =>
        atual.map((elemento) => {
          if (elemento.id !== id) return elemento
          if (!registro) return { ...elemento, nome }

          if (elemento.arquivo?.url) {
            URL.revokeObjectURL(elemento.arquivo.url)
            urls.current.delete(elemento.arquivo.url)
          }
          return { ...elemento, nome, arquivo: registro }
        }),
      )
    },
    [registrarArquivo],
  )

  const removerElemento = useCallback((id) => {
    setElementos((atual) => {
      const saindo = atual.find((elemento) => elemento.id === id)
      if (saindo?.arquivo?.url) {
        URL.revokeObjectURL(saindo.arquivo.url)
        urls.current.delete(saindo.arquivo.url)
      }
      return atual.filter((elemento) => elemento.id !== id)
    })
  }, [])

  // Ao entrar no fluxo, recupera o que já tinha sido salvo. Sem isso,
  // continuar de onde parou sobrescreveria os temas já preenchidos com vazio.
  useEffect(() => {
    let ativo = true

    lerManual()
      .then((salvo) => {
        const manual = deArmazenamento(salvo)
        if (!ativo || !manual) return

        Object.values(manual.uploads).forEach((porTipo) =>
          Object.values(porTipo).forEach((registro) => {
            if (registro?.url) urls.current.add(registro.url)
          }),
        )
        manual.elementos.forEach((elemento) => {
          if (elemento.arquivo?.url) urls.current.add(elemento.arquivo.url)
        })

        setUploads(manual.uploads)
        setPaleta(manual.paleta)
        setTipografia(manual.tipografia)
        setTomDeVoz(manual.tomDeVoz)
        setFotografia({ ...fotografiaVazia(), ...manual.fotografia })
        setPersonalidade(manual.personalidade)
        setElementos(manual.elementos)
      })
      .catch(() => {
        // Sem o que foi salvo o fluxo ainda funciona: começa vazio.
      })
      .finally(() => {
        if (ativo) setCarregando(false)
      })

    return () => {
      ativo = false
    }
  }, [])

  const estadoDoFluxo = useCallback(
    () => ({ uploads, paleta, tipografia, tomDeVoz, fotografia, personalidade, elementos }),
    [uploads, paleta, tipografia, tomDeVoz, fotografia, personalidade, elementos],
  )

  // A escrita do fluxo completo, na finalização: grava tudo de uma vez.
  const finalizar = useCallback(
    () => salvarManual(paraArmazenamento(estadoDoFluxo())),
    [estadoDoFluxo],
  )

  /*
   * A escrita da edição avulsa, vinda de um card vazio da Home: grava só a
   * fatia daquele tema por cima do manual que já estava no disco.
   *
   * Não dá para reaproveitar o `finalizar` aqui. O estado em memória nasce do
   * que foi lido na entrada, então gravá-lo inteiro *quase* preserva os demais
   * temas — mas se a leitura tiver falhado o hook começa vazio, e o "quase"
   * viraria apagar o manual todo para salvar um tema. Reler e mesclar agora
   * tira essa aposta do caminho.
   */
  const salvarTema = useCallback(
    async (slug) => {
      const salvo = await lerManual()
      await salvarManual({ ...(salvo ?? {}), ...fatiaDoTema(estadoDoFluxo(), slug, salvo) })
    },
    [estadoDoFluxo],
  )

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
    removerUpload,
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
    tomDeVoz,
    acoesDoTomDeVoz: {
      salvar: salvarTomDeVoz,
      remover: removerTomDeVoz,
    },
    fotografia,
    acoesDaFotografia: {
      alternarFoto,
      irParaTela: irParaTelaDaFotografia,
      irParaAba,
    },
    personalidade,
    acoesDaPersonalidade: { definirPosicao },
    elementos,
    acoesDosElementos: {
      adicionar: adicionarElemento,
      atualizar: atualizarElemento,
      remover: removerElemento,
    },
    carregando,
    finalizar,
    salvarTema,
  }
}
