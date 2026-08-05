import { useEffect, useRef } from 'react'
import Icon from './Icon.jsx'
import { pickerDeExemplo } from '../data/paletaMock.js'
import s from './ModalAdicionarCor.module.css'

const CAMPOS = [
  { rotulo: 'Hex', valor: pickerDeExemplo.hex },
  { rotulo: 'R', valor: pickerDeExemplo.r },
  { rotulo: 'G', valor: pickerDeExemplo.g },
  { rotulo: 'B', valor: pickerDeExemplo.b },
]

/**
 * Modal "Adicionar cor".
 *
 * Só o visual por enquanto: o picker é uma composição estática, e os campos
 * Hex/R/G/B mostram o exemplo do Figma. Arrastar as alças e sincronizar os
 * valores entra depois. "Continuar" ainda não lê cor nenhuma — só avança para
 * o estado preenchido com os dados de exemplo.
 */
export default function ModalAdicionarCor({ onFechar, onContinuar }) {
  const painelRef = useRef(null)

  useEffect(() => {
    painelRef.current?.focus()

    const aoTeclar = (evento) => {
      if (evento.key === 'Escape') onFechar()
    }

    document.addEventListener('keydown', aoTeclar)
    return () => document.removeEventListener('keydown', aoTeclar)
  }, [onFechar])

  return (
    <div className={s.fundo}>
      <div
        ref={painelRef}
        className={s.painel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-adicionar-cor"
        tabIndex={-1}
      >
        <div className={s.cabecalho}>
          <h2 id="titulo-adicionar-cor" className={s.titulo}>
            Adicionar cor
          </h2>
          <button type="button" className={s.fechar} onClick={onFechar} aria-label="Fechar">
            <Icon nome="Close" />
          </button>
        </div>

        <div className={s.campoNome}>
          <input
            type="text"
            className={s.entradaNome}
            placeholder="Nome da Cor"
            aria-label="Nome da cor"
          />
          <p className={s.dica}>(Ex.: Amarelo, Sol Nascente)</p>
        </div>

        <div className={s.picker}>
          {/* Composição estática: o arrasto das alças vem no próximo passo. */}
          <div
            className={s.area}
            style={{ '--cor-base': pickerDeExemplo.corBase }}
            aria-hidden="true"
          >
            <span className={s.alcaArea} style={{ background: pickerDeExemplo.corBase }} />
          </div>

          <div className={s.matiz} aria-hidden="true">
            <span className={s.alcaMatiz} style={{ background: pickerDeExemplo.corBase }} />
          </div>

          <div className={s.campos}>
            {CAMPOS.map(({ rotulo, valor }) => (
              <label key={rotulo} className={s.campo}>
                <span className={s.rotulo}>{rotulo}</span>
                <input className={s.entrada} value={valor} readOnly />
              </label>
            ))}
          </div>
        </div>

        <div className={s.acoes}>
          <button type="button" className={s.voltar} onClick={onFechar}>
            Voltar
          </button>
          <button type="button" className={s.continuar} onClick={onContinuar}>
            Continuar
          </button>
        </div>
      </div>
    </div>
  )
}
