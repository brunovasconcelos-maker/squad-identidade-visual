import { useParams } from 'react-router-dom'
import { temas } from '../data/pilares.js'

export default function PassoAPasso() {
  const { tema } = useParams()

  // Sem :tema  -> fluxo completo. Com :tema -> fluxo de um tema só.
  if (!tema) {
    return (
      <section className="page">
        <h1>Passo a Passo</h1>
        <p className="page-placeholder">Fluxo completo — conteúdo definido depois.</p>
      </section>
    )
  }

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
