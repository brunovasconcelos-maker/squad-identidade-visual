import { useEffect, useRef, useState } from 'react'
import Icon from './Icon.jsx'
import { AGENTES } from '../data/agentes.js'
import { urlDoAvatar } from '../lib/avatares.js'
import s from './ModalTomDeVoz.module.css'

const TOTAL_DE_PASSOS = 4

/**
 * As palavras a evitar são digitadas num campo só, separadas por vírgula. A
 * lista sai daí: sem espaços nas pontas, sem vazios e sem repetição (a
 * comparação ignora maiúsculas, mas quem manda no texto guardado é a primeira
 * grafia digitada).
 */
function palavrasDoTexto(texto) {
  const vistas = new Set()

  return texto
    .split(',')
    .map((parte) => parte.trim())
    .filter((palavra) => {
      if (!palavra) return false
      const chave = palavra.toLowerCase()
      if (vistas.has(chave)) return false
      vistas.add(chave)
      return true
    })
}

/** O caminho de volta: as linhas do passo 3 viram de novo o texto do passo 2. */
const textoDasPalavras = (evitar) =>
  evitar
    .map((par) => par.palavra.trim())
    .filter(Boolean)
    .join(', ')

/**
 * Modal de criar/editar um Tom de Voz, em quatro passos: nome e instruções,
 * palavras a evitar, substituições e agentes.
 *
 * Tudo o que é digitado aqui vive no estado deste componente e só sai pelo
 * `onSalvar`, no "Finalizar" do passo 4. Fechar pelo X, pelo "Voltar" do passo
 * 1, pelo Esc ou pelo fundo descarta a tentativa inteira, inclusive numa
 * edição — a lista fica como estava.
 *
 * `agentesOcupados` são os agentes já atribuídos a *outros* tons: aparecem
 * desabilitados, porque um agente tem um tom só. Numa edição, os agentes do
 * próprio tom não entram nessa lista e continuam selecionáveis.
 */
export default function ModalTomDeVoz({ tom, agentesOcupados, onSalvar, onFechar }) {
  const [passo, setPasso] = useState(1)
  const [nome, setNome] = useState(tom?.nome ?? '')
  const [instrucoes, setInstrucoes] = useState(tom?.instrucoes ?? '')
  const [evitar, setEvitar] = useState(tom?.evitar ?? [])
  // O texto cru do passo 2 é estado próprio: parsear a cada tecla comeria a
  // vírgula e o espaço que a pessoa acabou de digitar.
  const [texto, setTexto] = useState(textoDasPalavras(tom?.evitar ?? []))
  const [agentes, setAgentes] = useState(tom?.agentes ?? [])
  const campoDoNome = useRef(null)
  const painelRef = useRef(null)

  useEffect(() => {
    campoDoNome.current?.focus()
  }, [])

  useEffect(() => {
    const aoTeclar = (evento) => {
      if (evento.key === 'Escape') onFechar()
    }
    document.addEventListener('keydown', aoTeclar)
    return () => document.removeEventListener('keydown', aoTeclar)
  }, [onFechar])

  // Saindo do passo 2: o texto vira linhas, preservando a substituição já
  // escrita para uma palavra que continua na lista.
  const sincronizarPalavras = () => {
    setEvitar((atual) =>
      palavrasDoTexto(texto).map((palavra) => {
        const anterior = atual.find(
          (par) => par.palavra.toLowerCase() === palavra.toLowerCase(),
        )
        return anterior
          ? { ...anterior, palavra }
          : { id: crypto.randomUUID(), palavra, substituto: '', manual: false }
      }),
    )
  }

  const salvar = () => {
    onSalvar({
      id: tom?.id ?? crypto.randomUUID(),
      nome: nome.trim(),
      instrucoes: instrucoes.trim(),
      // Linha sem palavra não substitui nada: só existe enquanto o modal está
      // aberto, para a pessoa terminar de preencher.
      evitar: evitar
        .filter((par) => par.palavra.trim())
        .map((par) => ({
          id: par.id,
          palavra: par.palavra.trim(),
          substituto: par.substituto.trim(),
        })),
      agentes,
    })
  }

  const avancar = () => {
    if (passo === 2) sincronizarPalavras()
    if (passo === TOTAL_DE_PASSOS) {
      salvar()
      return
    }
    setPasso((atual) => atual + 1)
  }

  const voltar = () => {
    // No passo 1 o "Voltar" fecha o modal, como o X.
    if (passo === 1) {
      onFechar()
      return
    }
    if (passo === 3) setTexto(textoDasPalavras(evitar))
    setPasso((atual) => atual - 1)
  }

  // Só dois passos exigem alguma coisa: o nome no 1 e ao menos um agente no 4.
  // Palavras a evitar e substituições são opcionais.
  const podeAvancar =
    (passo !== 1 || Boolean(nome.trim())) && (passo !== TOTAL_DE_PASSOS || agentes.length > 0)

  return (
    <div
      className={s.fundo}
      onMouseDown={(evento) => {
        if (!painelRef.current?.contains(evento.target)) onFechar()
      }}
    >
      <div
        ref={painelRef}
        className={s.painel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-modal-tom-de-voz"
      >
        <div className={s.cabecalho}>
          <h2 id="titulo-modal-tom-de-voz" className={s.titulo}>
            {tom ? 'Editar Tom de Voz' : 'Novo Tom de Voz'}
          </h2>
          <button type="button" className={s.fechar} onClick={onFechar} aria-label="Fechar">
            <Icon nome="Close" />
          </button>
        </div>

        {passo === 1 ? (
          <div className={s.campoNome}>
            <div className={s.linhaCampo}>
              <input
                ref={campoDoNome}
                type="text"
                className={s.entrada}
                value={nome}
                placeholder="Nome da Tom de Voz"
                aria-label="Nome da Tom de Voz"
                onChange={(evento) => setNome(evento.target.value)}
                onKeyDown={(evento) => {
                  if (evento.key === 'Enter' && nome.trim()) avancar()
                }}
              />
            </div>
            <p className={s.dica}>(Ex.: Redes Sociais, Corporativo)</p>
          </div>
        ) : (
          // Nos passos seguintes o nome já está definido: fica no topo só para
          // lembrar de qual tom se trata.
          <p className={s.nomeDefinido}>{nome.trim()}</p>
        )}

        {passo === 1 && (
          <Bloco rotulo="Instruções Gerais" id="tom-de-voz-instrucoes">
            <textarea
              id="tom-de-voz-instrucoes"
              className={s.area}
              value={instrucoes}
              placeholder="Dê as instruções de como o Tom de Voz deve agir. Ex: Fale de maneira amigável e fácil de entender..."
              onChange={(evento) => setInstrucoes(evento.target.value)}
            />
          </Bloco>
        )}

        {passo === 2 && (
          <Bloco rotulo="Evite usar" id="tom-de-voz-evitar">
            <textarea
              id="tom-de-voz-evitar"
              className={s.area}
              value={texto}
              placeholder="Palavras que o Tom de Voz deva evitar usar. Separe-as por ”,”. Ex: Problema, Complicado, Difícil."
              onChange={(evento) => setTexto(evento.target.value)}
            />
          </Bloco>
        )}

        {passo === 3 && (
          <Substituicoes
            evitar={evitar}
            onAdicionar={() =>
              setEvitar((atual) => [
                ...atual,
                { id: crypto.randomUUID(), palavra: '', substituto: '', manual: true },
              ])
            }
            onMudarPalavra={(id, palavra) =>
              setEvitar((atual) =>
                atual.map((par) => (par.id === id ? { ...par, palavra } : par)),
              )
            }
            onMudarSubstituto={(id, substituto) =>
              setEvitar((atual) =>
                atual.map((par) => (par.id === id ? { ...par, substituto } : par)),
              )
            }
            onRemover={(id) => setEvitar((atual) => atual.filter((par) => par.id !== id))}
          />
        )}

        {passo === 4 && (
          <Atribuicao
            escolhidos={agentes}
            ocupados={agentesOcupados}
            onAlternar={(id) =>
              setAgentes((atual) =>
                atual.includes(id) ? atual.filter((outro) => outro !== id) : [...atual, id],
              )
            }
          />
        )}

        <div className={s.rodape}>
          <button type="button" className={s.voltar} onClick={voltar}>
            Voltar
          </button>
          <span className={s.contador}>
            {passo}/{TOTAL_DE_PASSOS}
          </span>
          <button
            type="button"
            className={s.continuar}
            onClick={avancar}
            disabled={!podeAvancar}
          >
            {passo === TOTAL_DE_PASSOS ? 'Finalizar' : 'Continuar'}
          </button>
        </div>
      </div>
    </div>
  )
}

/** Rótulo cinza acima de um campo, como nos passos 1 e 2 do Figma. */
function Bloco({ rotulo, id, children }) {
  return (
    <div className={s.bloco}>
      <label className={s.rotulo} htmlFor={id}>
        {rotulo}
      </label>
      {children}
    </div>
  )
}

/**
 * Passo 3: uma linha por palavra a evitar, com a sugestão de troca ao lado.
 *
 * A sugestão é opcional — em branco, quem escreve decide a palavra na hora. A
 * lixeira tira a palavra da lista de evitadas por inteiro, que é diferente de
 * deixar a sugestão vazia.
 *
 * As palavras que vieram do passo 2 são só leitura (para mudar, é lá); as
 * criadas aqui pelo "Adicionar" precisam de um campo para receber a palavra.
 */
function Substituicoes({ evitar, onAdicionar, onMudarPalavra, onMudarSubstituto, onRemover }) {
  return (
    <div className={s.secao}>
      <div className={s.cabecalhoDaSecao}>
        <span className={s.rotulo}>Substituir</span>
        <button type="button" className={s.adicionar} onClick={onAdicionar}>
          Adicionar
          <Icon nome="Add" />
        </button>
      </div>

      {evitar.length === 0 ? (
        <p className={s.vazio}>
          Nenhuma palavra a evitar. Use o “Adicionar” ou volte um passo para escrevê-las.
        </p>
      ) : (
        <ul className={s.linhas}>
          {evitar.map((par) => (
            <li key={par.id} className={s.linha}>
              {par.manual ? (
                <input
                  type="text"
                  className={`${s.caixa} ${s.caixaPalavra}`}
                  value={par.palavra}
                  placeholder="Palavra a evitar"
                  aria-label="Palavra a evitar"
                  onChange={(evento) => onMudarPalavra(par.id, evento.target.value)}
                />
              ) : (
                <span className={`${s.caixa} ${s.caixaPalavra} ${s.caixaLida}`}>
                  {par.palavra}
                </span>
              )}

              <input
                type="text"
                className={s.caixa}
                value={par.substituto}
                placeholder="Substituir por"
                aria-label={
                  par.palavra ? `Substituir “${par.palavra}” por` : 'Substituir por'
                }
                onChange={(evento) => onMudarSubstituto(par.id, evento.target.value)}
              />

              <button
                type="button"
                className={s.excluirLinha}
                onClick={() => onRemover(par.id)}
                aria-label={
                  par.palavra ? `Remover “${par.palavra}” da lista` : 'Remover a linha'
                }
              >
                <Icon nome="Delete" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/**
 * Passo 4: a grade de agentes, duas colunas de três preenchidas coluna a
 * coluna. Um agente já atribuído a outro tom aparece desabilitado.
 */
function Atribuicao({ escolhidos, ocupados, onAlternar }) {
  return (
    <div className={s.secao}>
      <span className={s.rotulo}>Atribuir (Escolha pelo menos um agente):</span>

      <div className={s.grade}>
        {AGENTES.map((agente) => {
          const marcado = escolhidos.includes(agente.id)
          const ocupado = ocupados.has(agente.id)

          return (
            <label
              key={agente.id}
              className={ocupado ? `${s.agente} ${s.agenteOcupado}` : s.agente}
              title={ocupado ? 'Já atribuído a outro Tom de Voz' : undefined}
            >
              <input
                type="checkbox"
                className={s.caixaNativa}
                checked={marcado}
                disabled={ocupado}
                onChange={() => onAlternar(agente.id)}
              />
              <Icon nome={marcado ? 'Check' : 'Check-Empt'} />
              <img className={s.avatar} src={urlDoAvatar(agente.id)} alt="" />
              <span className={s.nomeDoAgente}>{agente.nome}</span>
            </label>
          )
        })}
      </div>
    </div>
  )
}
