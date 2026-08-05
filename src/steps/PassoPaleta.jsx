import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import ModalCor from '../components/ModalCor.jsx'
import { escalaCompleta, nivelDeContraste } from '../lib/cor.js'
import s from './PassoPaleta.module.css'

/**
 * Passo de Paleta de Cores.
 *
 * O modal serve tanto para adicionar quanto para editar: `emEdicao` guarda a
 * cor sendo editada, ou null quando é uma cor nova. Toda a paleta vem do
 * estado do fluxo, então sobrevive à navegação entre passos.
 */
export default function PassoPaleta({ paleta, acoes }) {
  const [modalAberto, setModalAberto] = useState(false)
  const [emEdicao, setEmEdicao] = useState(null)

  const abrirNova = () => {
    setEmEdicao(null)
    setModalAberto(true)
  }

  const abrirEdicao = (cor) => {
    setEmEdicao(cor)
    setModalAberto(true)
  }

  const fechar = () => {
    setModalAberto(false)
    setEmEdicao(null)
  }

  const salvar = ({ nome, hex }) => {
    if (emEdicao) acoes.atualizar(emEdicao.id, { nome, hex })
    else acoes.adicionar({ nome, hex })
    fechar()
  }

  return (
    <div className={s.passo}>
      <div className={s.cabecalho}>
        <div className={s.tituloGrupo}>
          <h2 className={s.titulo}>Paleta da Marca</h2>
          {/* Ainda sem modal de ajuda: por enquanto só o hover. */}
          <button type="button" className={s.ajuda} aria-label="Sobre a paleta da marca">
            <Icon nome="Help" />
          </button>
        </div>

        <button type="button" className={s.botaoContorno} onClick={abrirNova}>
          Adicionar Cor
          <Icon nome="Add" />
        </button>
      </div>

      {paleta.length > 0 ? (
        <div className={s.lista}>
          {paleta.map((cor) => (
            <CartaoDeCor key={cor.id} cor={cor} acoes={acoes} onEditar={() => abrirEdicao(cor)} />
          ))}
        </div>
      ) : (
        <button type="button" className={s.vazio} onClick={abrirNova}>
          <Icon nome="Paleta" tamanho={40} />
          <span className={s.textoVazio}>Adicione as cores da sua marca</span>
        </button>
      )}

      {modalAberto && <ModalCor cor={emEdicao} onCancelar={fechar} onSalvar={salvar} />}
    </div>
  )
}

function CartaoDeCor({ cor, acoes, onEditar }) {
  const completa = escalaCompleta(cor.tons)

  return (
    <div className={s.cartao}>
      <div className={s.linha}>
        <div className={s.identificacao}>
          <div className={s.amostra} style={{ background: `#${cor.hex}` }}>
            <span className={s.selo}>
              <span className={s.seloPonto} />
              {nivelDeContraste(cor.hex)}
            </span>
          </div>

          <div className={s.nomes}>
            <span className={s.nome}>{cor.nome}</span>
            <span className={s.hex}>{cor.hex}</span>
          </div>
        </div>

        <div className={s.acoes}>
          <button
            type="button"
            className={s.acao}
            onClick={onEditar}
            aria-label={`Editar ${cor.nome}`}
          >
            <Icon nome="Edit" />
          </button>

          <button
            type="button"
            className={cor.principal ? `${s.acao} ${s.marcada}` : s.acao}
            onClick={() => acoes.marcarPrincipal(cor.id)}
            aria-pressed={cor.principal}
            aria-label={`Definir ${cor.nome} como cor principal`}
          >
            <Icon nome={cor.principal ? 'Star-Filled' : 'Star'} />
          </button>

          <button
            type="button"
            className={`${s.acao} ${s.destrutiva}`}
            onClick={() => acoes.remover(cor.id)}
            aria-label={`Excluir ${cor.nome}`}
          >
            <Icon nome="Delete" />
          </button>
        </div>
      </div>

      <div className={s.linha}>
        <div className={s.tons}>
          {cor.tons.map((tom) => (
            <div
              key={tom.passo}
              className={s.tom}
              style={{ background: `#${tom.hex}` }}
              title={`${tom.passo} — #${tom.hex}`}
            >
              <span className={tom.textoClaro ? `${s.ponto} ${s.pontoClaro}` : s.ponto} />
            </div>
          ))}
        </div>

        {/* Some quando os dez degraus estão ocupados. */}
        {!completa && (
          <button
            type="button"
            className={s.botaoContorno}
            onClick={() => acoes.adicionarTom(cor.id)}
          >
            Adicionar Tom
          </button>
        )}
      </div>
    </div>
  )
}
