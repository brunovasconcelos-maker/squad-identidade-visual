import { Link } from 'react-router-dom'
import Icon from './Icon.jsx'
import s from './PillarCard.module.css'

/**
 * Card de um pilar da identidade visual.
 *
 * Vazio, o card leva para o fluxo naquele tema; preenchido, leva para a
 * página do tema, onde depois entra a visualização do que foi salvo. No
 * preenchido o resumo vem em `children`, no lugar do "Nada adicionado".
 */
export default function PillarCard({ slug, titulo, icone, estado = 'vazio', children }) {
  const vazio = estado === 'vazio'

  return (
    <Link
      to={vazio ? `/passo-a-passo/${slug}` : `/${slug}`}
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
