import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import FlowTopBar from '../components/FlowTopBar.jsx'
import FlowBottomBar from '../components/FlowBottomBar.jsx'
import { pilares, temas } from '../data/pilares.js'
import s from './PassoAPasso.module.css'

export default function PassoAPasso() {
  const { tema } = useParams()

  // Sem :tema -> fluxo completo. Com :tema -> fluxo de um tema só.
  return tema ? <FluxoDeUmTema tema={tema} /> : <FluxoCompleto />
}

function FluxoCompleto() {
  const navigate = useNavigate()
  const total = pilares.length
  const [passo, setPasso] = useState(1)

  // Placeholder até existir conteúdo por passo: mantém "Continuar" desabilitado.
  const [temConteudo] = useState(false)

  const irParaHome = () => navigate('/')

  const voltar = () => {
    if (passo === 1) irParaHome()
    else setPasso((atual) => atual - 1)
  }

  const avancar = () => {
    if (passo === total) irParaHome()
    else setPasso((atual) => atual + 1)
  }

  return (
    <div className={s.pagina}>
      <FlowTopBar titulo="Identidade Visual" onFechar={irParaHome} />

      {/* O conteúdo de cada passo entra aqui — só esta área rola. */}
      <main className={s.conteudo} />

      <FlowBottomBar
        passo={passo}
        total={total}
        temConteudo={temConteudo}
        onVoltar={voltar}
        onPular={avancar}
        onContinuar={avancar}
      />
    </div>
  )
}

// Ainda é o placeholder do setup: o fluxo de um tema só será especificado depois.
function FluxoDeUmTema({ tema }) {
  if (!temas.includes(tema)) {
    return (
      <section className="page">
        <h1>Passo a Passo</h1>
        <p className="page-placeholder">Tema desconhecido: “{tema}”.</p>
      </section>
    )
  }

  return (
    <section className="page">
      <h1>Passo a Passo — {tema}</h1>
      <p className="page-placeholder">Fluxo do tema — conteúdo definido depois.</p>
    </section>
  )
}
