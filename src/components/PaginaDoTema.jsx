import { Link } from 'react-router-dom'
import Carregando from './Carregando.jsx'
import Icon from './Icon.jsx'
import s from './PaginaDoTema.module.css'

/**
 * A casca comum das páginas de leitura de um tema.
 *
 * Cuida do topo, da coluna de 808px e do estado vazio; o conteúdo vem em
 * `children`, e só é montado quando há o que mostrar (`temConteudo`).
 *
 * No Figma o canto direito do topo tem o menu de três pontos, que é da Home.
 * Aqui ele dá lugar ao atalho de edição, que a página precisa ter.
 */
export default function PaginaDoTema({ titulo, slug, carregando, temConteudo, vazio, children }) {
  if (carregando) return <Carregando mensagens={['Abrindo seu manual...']} />

  return (
    <div className={s.pagina}>
      <header className={s.topo}>
        <Link to="/" className={s.voltar} aria-label="Voltar para a Home">
          <Icon nome="Arrow-Left" />
        </Link>
        <h1 className={s.titulo}>{titulo}</h1>
        <Link to={`/passo-a-passo/${slug}`} className={s.editar}>
          Editar
        </Link>
      </header>

      <main className={s.conteudo}>
        {temConteudo ? <div className={s.secoes}>{children}</div> : <p className={s.vazio}>{vazio}</p>}
      </main>
    </div>
  )
}
