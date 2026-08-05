import { Link } from 'react-router-dom'
import Icon from './Icon.jsx'
import s from './PillarCard.module.css'

/**
 * Card de um pilar da identidade visual.
 *
 * `estado` controla a aparência: hoje só existe 'vazio', mas a estrutura já
 * está pronta para 'preenchido' — nesse caso o conteúdo do preview entra em
 * `children`, no lugar do "Nada adicionado", sem mexer no layout.
 */
export default function PillarCard({ slug, titulo, icone, estado = 'vazio', children }) {
  const vazio = estado === 'vazio'

  return (
    <Link
      to={`/passo-a-passo/${slug}`}
      className={[s.card, vazio ? s.vazio : s.preenchido].join(' ')}
    >
      <div className={s.topo}>
        <span className={s.tile}>
          <Icon nome={icone} />
        </span>
        <Icon nome="Arrow-Up" className={s.seta} />
      </div>

      <div className={s.texto}>
        <h2 className={s.titulo}>{titulo}</h2>
        {vazio ? <p className={s.legenda}>Nada adicionado</p> : children}
      </div>
    </Link>
  )
}
