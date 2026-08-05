import TopBar from '../components/TopBar.jsx'
import Banner from '../components/Banner.jsx'
import PillarCard from '../components/PillarCard.jsx'
import { pilares } from '../data/pilares.js'
import s from './Home.module.css'

export default function Home() {
  return (
    <div className={s.pagina}>
      <div className={s.faixaLarga}>
        <TopBar titulo="Identidade Visual" />
      </div>

      <div className={s.faixaLarga}>
        <Banner />
      </div>

      <div className={s.grade}>
        {pilares.map((pilar) => (
          <PillarCard
            key={pilar.slug}
            slug={pilar.slug}
            titulo={pilar.titulo}
            icone={pilar.icone}
            estado="vazio"
          />
        ))}
      </div>
    </div>
  )
}
