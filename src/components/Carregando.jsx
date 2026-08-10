import s from './Carregando.module.css'

/**
 * Tela de espera genérica. É proposital que seja simples: ganha o desenho
 * definitivo depois.
 */
export default function Carregando({ mensagem = 'Carregando…' }) {
  return (
    <div className={s.tela} role="status" aria-live="polite">
      <span className={s.roda} aria-hidden="true" />
      <p className={s.mensagem}>{mensagem}</p>
    </div>
  )
}
