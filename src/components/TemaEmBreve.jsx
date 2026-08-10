import { Link } from 'react-router-dom'
import s from './TemaEmBreve.module.css'

/**
 * Página de um tema já preenchido.
 *
 * Por enquanto só avisa que ainda não existe: a visualização e a edição do que
 * foi salvo serão desenhadas depois. O link para editar leva ao fluxo naquele
 * tema, que é o caminho que já existe hoje.
 */
export default function TemaEmBreve({ titulo, slug }) {
  return (
    <section className={s.pagina}>
      <h1 className={s.titulo}>{titulo}</h1>
      <p className={s.mensagem}>Em breve.</p>
      <div className={s.acoes}>
        <Link to="/" className={s.link}>
          Voltar para a Home
        </Link>
        <Link to={`/passo-a-passo/${slug}`} className={s.link}>
          Editar no passo a passo
        </Link>
      </div>
    </section>
  )
}
