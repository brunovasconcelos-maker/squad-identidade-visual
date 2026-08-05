import Icon from './Icon.jsx'
import s from './FlowTopBar.module.css'

export default function FlowTopBar({ titulo, onFechar }) {
  return (
    <header className={s.barra}>
      <h1 className={s.titulo}>{titulo}</h1>

      <button type="button" className={s.fechar} onClick={onFechar} aria-label="Fechar">
        <Icon nome="Close" />
      </button>
    </header>
  )
}
