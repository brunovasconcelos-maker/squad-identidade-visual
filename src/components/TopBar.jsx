import Icon from './Icon.jsx'
import s from './TopBar.module.css'

// Voltar e opções ainda não fazem nada — o menu de opções entra depois.
export default function TopBar({ titulo }) {
  return (
    <div className={s.barra}>
      <div className={s.esquerda}>
        <button type="button" className={s.voltar} aria-label="Voltar">
          <Icon nome="Arrow-Left" />
        </button>
        <h1 className={s.titulo}>{titulo}</h1>
      </div>

      <button type="button" className={s.opcoes} aria-label="Mais opções">
        <Icon nome="More" />
      </button>
    </div>
  )
}
