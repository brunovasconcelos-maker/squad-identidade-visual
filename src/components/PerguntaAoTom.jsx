import { useEffect, useRef, useState } from 'react'
import Icon from './Icon.jsx'
import tom from '../assets/imagens/Tom-Home.png'
import { perguntasDoTema } from '../data/perguntasDoTom.js'
import s from './PerguntaAoTom.module.css'

/**
 * O ajudante do fluxo — nodes 6218:6458 (parado), 6218:6510 (hover) e
 * 6218:6570 (aberto) do Figma.
 *
 * Aparece nos oito passos e em nenhum outro lugar; quem o monta é a área do
 * passo, que existe nos dois modos do fluxo. O `tema` decide só quais
 * sugestões aparecem — a lista mora em src/data/perguntasDoTom.js, e um
 * componente serve os oito temas.
 *
 * O Tom continua na tela com o painel aberto, embaixo dele, como no Figma.
 *
 * Por enquanto é visual: fecham-se o painel e digita-se no campo, e nada mais.
 * As sugestões e o avião de enviar estão no desenho, então estão aqui, mas sem
 * ação — marcados com `aria-disabled` em vez de `disabled` porque continuam
 * alcançáveis pelo teclado e mantêm o hover do desenho, enquanto dizem a quem
 * usa leitor de tela que ainda não fazem nada.
 */
export default function PerguntaAoTom({ tema }) {
  const [aberto, setAberto] = useState(false)
  const [pergunta, setPergunta] = useState('')
  // Passar o mouse (ou dar foco pelo teclado) no Tom o balança, como no botão
  // "Começar" da Home.
  const [balancando, setBalancando] = useState(false)
  const campoRef = useRef(null)

  const perguntas = perguntasDoTema(tema)

  useEffect(() => {
    if (aberto) campoRef.current?.focus()
  }, [aberto])

  useEffect(() => {
    if (!aberto) return undefined
    const aoTeclar = (evento) => {
      if (evento.key === 'Escape') setAberto(false)
    }
    document.addEventListener('keydown', aoTeclar)
    return () => document.removeEventListener('keydown', aoTeclar)
  }, [aberto])

  return (
    <div className={s.canto}>
      {aberto && (
        <section className={s.painel} aria-label="Pergunte ao Tom">
          <div className={s.cabecalho}>
            <p className={s.saudacao}>Me faça qualquer pergunta!</p>
            <button
              type="button"
              className={s.fechar}
              onClick={() => setAberto(false)}
              aria-label="Fechar"
            >
              <Icon nome="Close" />
            </button>
          </div>

          {/* O vão do meio é onde a conversa vai aparecer. Por ora só empurra
              as sugestões e o campo para baixo, como no Figma. */}
          <div className={s.conversa} />

          <ul className={s.sugestoes}>
            {perguntas.map((texto) => (
              <li key={texto}>
                <button type="button" className={s.sugestao} aria-disabled="true">
                  {texto}
                  <Icon nome="Add" />
                </button>
              </li>
            ))}
          </ul>

          <div className={s.campo}>
            <input
              ref={campoRef}
              type="text"
              className={s.entrada}
              value={pergunta}
              placeholder="Faça uma pergunta"
              aria-label="Faça uma pergunta"
              onChange={(evento) => setPergunta(evento.target.value)}
            />
            <button type="button" className={s.enviar} aria-disabled="true" aria-label="Enviar">
              <Icon nome="Send" tamanho={16} />
            </button>
          </div>
        </section>
      )}

      <button
        type="button"
        className={s.gatilho}
        onClick={() => setAberto((estava) => !estava)}
        onMouseEnter={() => setBalancando(true)}
        onMouseLeave={() => setBalancando(false)}
        onFocus={() => setBalancando(true)}
        onBlur={() => setBalancando(false)}
        aria-expanded={aberto}
      >
        {/* O rótulo é o mesmo nos dois estados: parado ele nomeia o botão para
            quem não enxerga a ilustração, e no hover aparece como no Figma.
            Com o painel aberto some de vez — lá o painel já se apresenta. */}
        <span className={aberto ? `${s.rotulo} ${s.rotuloOculto}` : s.rotulo}>Pergunte ao Tom</span>
        <img
          src={tom}
          alt=""
          className={[s.tom, balancando && s.balancando].filter(Boolean).join(' ')}
        />
      </button>
    </div>
  )
}
