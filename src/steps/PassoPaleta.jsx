import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import ModalAdicionarCor from '../components/ModalAdicionarCor.jsx'
import { corDeExemplo } from '../data/paletaMock.js'
import s from './PassoPaleta.module.css'

/**
 * Passo de Paleta de Cores — só interface, com dados mockados.
 *
 * Três estados: vazio, modal de "Adicionar cor" e preenchido. O modal não lê
 * cor nenhuma ainda: "Continuar" apenas leva ao estado preenchido usando a cor
 * de exemplo. Escolher cor de verdade, gerar tons e calcular contraste vem
 * depois.
 */
export default function PassoPaleta() {
  const [modalAberto, setModalAberto] = useState(false)
  const [cores, setCores] = useState([])

  const preenchido = cores.length > 0

  const confirmarCor = () => {
    setCores([corDeExemplo])
    setModalAberto(false)
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

        <button type="button" className={s.botaoContorno} onClick={() => setModalAberto(true)}>
          Adicionar Cor
          <Icon nome="Add" />
        </button>
      </div>

      {preenchido ? (
        cores.map((cor) => <CartaoDeCor key={cor.hex} cor={cor} />)
      ) : (
        <button type="button" className={s.vazio} onClick={() => setModalAberto(true)}>
          <Icon nome="Paleta" tamanho={40} />
          <span className={s.textoVazio}>Adicione as cores da sua marca</span>
        </button>
      )}

      {modalAberto && (
        <ModalAdicionarCor onFechar={() => setModalAberto(false)} onContinuar={confirmarCor} />
      )}
    </div>
  )
}

function CartaoDeCor({ cor }) {
  return (
    <div className={s.cartao}>
      <div className={s.linha}>
        <div className={s.identificacao}>
          <div className={s.amostra} style={{ background: `#${cor.hex}` }}>
            <span className={s.selo}>
              <span className={s.seloPonto} />
              {cor.contraste}
            </span>
          </div>

          <div className={s.nomes}>
            <span className={s.nome}>{cor.nome}</span>
            <span className={s.hex}>{cor.hex}</span>
          </div>
        </div>

        {/* Nenhuma das três ainda faz nada. */}
        <div className={s.acoes}>
          <button type="button" className={s.acao} aria-label={`Editar ${cor.nome}`}>
            <Icon nome="Edit" />
          </button>
          <button type="button" className={s.acao} aria-label={`Favoritar ${cor.nome}`}>
            <Icon nome="Star" />
          </button>
          <button
            type="button"
            className={`${s.acao} ${s.destrutiva}`}
            aria-label={`Excluir ${cor.nome}`}
          >
            <Icon nome="Delete" />
          </button>
        </div>
      </div>

      <div className={s.linha}>
        <div className={s.tons}>
          {cor.tons.map((tom) => (
            <div key={tom.hex} className={s.tom} style={{ background: `#${tom.hex}` }}>
              <span className={tom.pontoClaro ? `${s.ponto} ${s.pontoClaro}` : s.ponto} />
            </div>
          ))}
        </div>

        <button type="button" className={s.botaoContorno}>
          Adicionar Tom
        </button>
      </div>
    </div>
  )
}
