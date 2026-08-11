import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import ModalTomDeVoz from '../components/ModalTomDeVoz.jsx'
import { AGENTES, nomeDoAgente } from '../data/agentes.js'
import { urlDoAvatar } from '../lib/avatares.js'
import s from './PassoTomDeVoz.module.css'

/**
 * Passo de Tom de Voz: a lista do que já foi criado, e o botão que abre o
 * modal de quatro passos.
 *
 * Cada agente pertence a um tom só. Com os seis já atribuídos não há tom novo
 * possível, então o "Criar Tom de Voz" fica desabilitado — dá para editar ou
 * excluir os existentes para liberar alguém.
 *
 * O passo inteiro é opcional: o "Continuar" da barra inferior está sempre
 * habilitado, e por isso o "Não tenho, pular" nunca aparece aqui.
 */
export default function PassoTomDeVoz({ tons, acoes }) {
  // `null` fechado, `{ tom }` editando, `{}` criando.
  const [modal, setModal] = useState(null)

  const atribuidos = new Set(tons.flatMap((tom) => tom.agentes))
  const semAgenteLivre = atribuidos.size >= AGENTES.length

  // Numa edição, os agentes do próprio tom continuam disponíveis; os dos
  // outros, não.
  const ocupadosPelosOutros = new Set(
    tons.filter((tom) => tom.id !== modal?.tom?.id).flatMap((outro) => outro.agentes),
  )

  return (
    <div className={s.passo}>
      <div className={s.cabecalho}>
        <div className={s.tituloGrupo}>
          <h2 className={s.titulo}>Tom de Voz</h2>
          {/* Ainda sem modal de ajuda: por enquanto só o hover. */}
          <button type="button" className={s.ajuda} aria-label="Sobre o tom de voz">
            <Icon nome="Help" />
          </button>
        </div>

        <button
          type="button"
          className={s.criar}
          onClick={() => setModal({})}
          disabled={semAgenteLivre}
          title={
            semAgenteLivre
              ? 'Todos os agentes já têm um Tom de Voz atribuído.'
              : undefined
          }
        >
          Criar Tom de Voz
          <Icon nome="Add" />
        </button>
      </div>

      {tons.length > 0 && (
        <ul className={s.lista}>
          {tons.map((tom) => (
            <li key={tom.id} className={s.cartao}>
              <div className={s.grupo}>
                <span className={s.selo}>
                  <Icon nome="Personalidade" tamanho={32} />
                </span>
                <span className={s.nome}>{tom.nome}</span>
              </div>

              <div className={s.avatares}>
                {tom.agentes.map((id) => (
                  <img
                    key={id}
                    className={s.avatar}
                    src={urlDoAvatar(id)}
                    alt={nomeDoAgente(id)}
                    title={nomeDoAgente(id)}
                  />
                ))}
              </div>

              <div className={s.acoes}>
                <button
                  type="button"
                  className={s.acao}
                  onClick={() => setModal({ tom })}
                  aria-label={`Editar ${tom.nome}`}
                >
                  <Icon nome="Edit" />
                </button>
                <button
                  type="button"
                  className={`${s.acao} ${s.destrutiva}`}
                  onClick={() => acoes.remover(tom.id)}
                  aria-label={`Excluir ${tom.nome}`}
                >
                  <Icon nome="Delete" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {modal && (
        <ModalTomDeVoz
          tom={modal.tom}
          agentesOcupados={ocupadosPelosOutros}
          onSalvar={(tom) => {
            acoes.salvar(tom)
            setModal(null)
          }}
          onFechar={() => setModal(null)}
        />
      )}
    </div>
  )
}
