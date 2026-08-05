import { useEffect, useRef, useState } from 'react'
import Icon from './Icon.jsx'
import {
  COR_PADRAO,
  hexParaRgb,
  hexValido,
  hsvParaRgb,
  rgbParaHex,
  rgbParaHsv,
} from '../lib/cor.js'
import s from './ModalCor.module.css'

const CANAIS = ['r', 'g', 'b']

function hexParaHsv(hex) {
  return rgbParaHsv(hexParaRgb(hex))
}

function hsvParaHex(hsv) {
  return rgbParaHex(hsvParaRgb(hsv))
}

// Posição do ponteiro como fração 0..1 dentro do elemento.
function fracaoNoElemento(elemento, evento) {
  const caixa = elemento.getBoundingClientRect()
  const x = (evento.clientX - caixa.left) / caixa.width
  const y = (evento.clientY - caixa.top) / caixa.height
  return { x: Math.min(1, Math.max(0, x)), y: Math.min(1, Math.max(0, y)) }
}

/**
 * Modal de adicionar/editar cor.
 *
 * A fonte da verdade é o HSV: o quadrado mexe em saturação e valor, a barra
 * mexe no matiz, e os campos Hex e R/G/B escrevem de volta nele. Assim tudo
 * fica sincronizado sem laço de atualização.
 */
export default function ModalCor({ cor, onCancelar, onSalvar }) {
  const edicao = Boolean(cor)

  const [nome, setNome] = useState(cor?.nome ?? '')
  const [hsv, setHsv] = useState(() => hexParaHsv(cor?.hex ?? COR_PADRAO))
  // Texto separado do valor: enquanto a pessoa digita, o hex pode estar
  // incompleto e não deve virar cor.
  const [textoHex, setTextoHex] = useState(() => `#${cor?.hex ?? COR_PADRAO}`)

  const painelRef = useRef(null)
  const areaRef = useRef(null)
  const matizRef = useRef(null)

  const hex = hsvParaHex(hsv)
  const rgb = hexParaRgb(hex)
  const corDaMatiz = hsvParaHex({ h: hsv.h, s: 1, v: 1 })

  const definirPorHsv = (novo) => {
    setHsv(novo)
    setTextoHex(`#${hsvParaHex(novo)}`)
  }

  const definirPorRgb = (novoRgb) => {
    const novoHex = rgbParaHex(novoRgb)
    setHsv(hexParaHsv(novoHex))
    setTextoHex(`#${novoHex}`)
  }

  useEffect(() => {
    painelRef.current?.focus()

    const aoTeclar = (evento) => {
      if (evento.key === 'Escape') onCancelar()
    }

    document.addEventListener('keydown', aoTeclar)
    return () => document.removeEventListener('keydown', aoTeclar)
  }, [onCancelar])

  const arrastar = (ref, aoMover) => (evento) => {
    const elemento = ref.current
    if (!elemento) return

    elemento.setPointerCapture(evento.pointerId)
    aoMover(fracaoNoElemento(elemento, evento))

    const mover = (e) => aoMover(fracaoNoElemento(elemento, e))
    const soltar = () => {
      elemento.removeEventListener('pointermove', mover)
      elemento.removeEventListener('pointerup', soltar)
      elemento.removeEventListener('pointercancel', soltar)
    }

    elemento.addEventListener('pointermove', mover)
    elemento.addEventListener('pointerup', soltar)
    elemento.addEventListener('pointercancel', soltar)
  }

  const moverNaArea = ({ x, y }) => definirPorHsv({ ...hsv, s: x, v: 1 - y })
  const moverNaMatiz = ({ x }) => definirPorHsv({ ...hsv, h: x * 360 })

  const digitarHex = (valor) => {
    setTextoHex(valor)
    if (hexValido(valor)) setHsv(hexParaHsv(valor))
  }

  const digitarCanal = (canal, valor) => {
    if (valor === '') return
    const numero = Number(valor)
    if (Number.isNaN(numero)) return
    definirPorRgb({ ...rgb, [canal]: Math.min(255, Math.max(0, numero)) })
  }

  const salvar = () => onSalvar({ nome, hex })

  return (
    <div className={s.fundo}>
      <div
        ref={painelRef}
        className={s.painel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-modal-cor"
        tabIndex={-1}
      >
        <div className={s.cabecalho}>
          <h2 id="titulo-modal-cor" className={s.titulo}>
            {edicao ? 'Editar cor' : 'Adicionar cor'}
          </h2>
          <button type="button" className={s.fechar} onClick={onCancelar} aria-label="Fechar">
            <Icon nome="Close" />
          </button>
        </div>

        <div className={s.campoNome}>
          <input
            type="text"
            className={s.entradaNome}
            placeholder="Nome da Cor"
            aria-label="Nome da cor"
            value={nome}
            onChange={(evento) => setNome(evento.target.value)}
          />
          <p className={s.dica}>(Ex.: Amarelo, Sol Nascente)</p>
        </div>

        <div className={s.picker}>
          <div className={s.campos}>
            <label className={s.campo}>
              <span className={s.rotulo}>Hex</span>
              <input
                className={s.entrada}
                value={textoHex}
                onChange={(evento) => digitarHex(evento.target.value)}
                onBlur={() => setTextoHex(`#${hex}`)}
                aria-invalid={!hexValido(textoHex)}
                spellCheck={false}
              />
            </label>

            {CANAIS.map((canal) => (
              <label key={canal} className={s.campo}>
                <span className={s.rotulo}>{canal.toUpperCase()}</span>
                <input
                  className={s.entrada}
                  type="number"
                  min={0}
                  max={255}
                  value={Math.round(rgb[canal])}
                  onChange={(evento) => digitarCanal(canal, evento.target.value)}
                />
              </label>
            ))}
          </div>

          <div
            ref={areaRef}
            className={s.area}
            style={{ '--cor-base': `#${corDaMatiz}` }}
            onPointerDown={arrastar(areaRef, moverNaArea)}
          >
            <span
              className={s.alca}
              style={{
                left: `${hsv.s * 100}%`,
                top: `${(1 - hsv.v) * 100}%`,
                background: `#${hex}`,
              }}
            />
          </div>

          <div
            ref={matizRef}
            className={s.matiz}
            onPointerDown={arrastar(matizRef, moverNaMatiz)}
          >
            <span
              className={s.alca}
              style={{ left: `${(hsv.h / 360) * 100}%`, top: '50%', background: `#${corDaMatiz}` }}
            />
          </div>

        </div>

        <div className={s.acoes}>
          <button type="button" className={s.voltar} onClick={onCancelar}>
            Voltar
          </button>
          <button type="button" className={s.continuar} onClick={salvar}>
            Continuar
          </button>
        </div>
      </div>
    </div>
  )
}
