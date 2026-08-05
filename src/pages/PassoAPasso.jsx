import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import FlowTopBar from '../components/FlowTopBar.jsx'
import FlowBottomBar from '../components/FlowBottomBar.jsx'
import PassoLogo from '../steps/PassoLogo.jsx'
import useLogos from '../hooks/useLogos.js'
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
  const { logos, salvar } = useLogos()

  const pilarAtual = pilares[passo - 1]

  // Só o passo de Logo tem conteúdo por enquanto; nos outros o "Continuar"
  // segue desabilitado. As variações preta e branca são opcionais.
  const temConteudo = pilarAtual.slug === 'logo' && Boolean(logos.principal)

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

      {/* Só esta área rola. Os outros seis passos entram aqui depois. */}
      <main className={s.conteudo}>
        <div className={s.grade}>
          <div className={s.centro}>
            {pilarAtual.slug === 'logo' && <PassoLogo logos={logos} onSalvar={salvar} />}
          </div>
        </div>
      </main>

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
