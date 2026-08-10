import Carregando from '../components/Carregando.jsx'
import TopBar from '../components/TopBar.jsx'
import Banner from '../components/Banner.jsx'
import PillarCard from '../components/PillarCard.jsx'
import useManual from '../hooks/useManual.js'
import { pilares } from '../data/pilares.js'
import {
  percentualPreenchido,
  primeiroTemaIncompleto,
  resumoDoTema,
  temaCompleto,
} from '../lib/manual.js'
import s from './Home.module.css'

export default function Home() {
  const { manual, carregando, reiniciar } = useManual()

  // Sem isso a Home pisca no estado vazio antes de mostrar o que foi salvo.
  if (carregando) return <Carregando />

  const percentual = percentualPreenchido(manual)
  const proximo = primeiroTemaIncompleto(manual)

  const confirmarReinicio = async () => {
    const certeza = window.confirm(
      'Isto apaga todo o manual salvo e não pode ser desfeito. Deseja reiniciar?',
    )
    if (certeza) await reiniciar()
  }

  return (
    <div className={s.pagina}>
      <div className={s.faixaLarga}>
        <TopBar titulo="Identidade Visual" onReiniciar={confirmarReinicio} />
      </div>

      <div className={s.faixaLarga}>
        <Banner percentual={percentual} proximo={proximo} />
      </div>

      <div className={s.grade}>
        {pilares.map((pilar) => {
          const preenchido = temaCompleto(manual, pilar.slug)

          return (
            <PillarCard
              key={pilar.slug}
              slug={pilar.slug}
              titulo={pilar.titulo}
              icone={pilar.icone}
              estado={preenchido ? 'preenchido' : 'vazio'}
            >
              <p className={s.resumo}>{resumoDoTema(manual, pilar.slug)}</p>
            </PillarCard>
          )
        })}
      </div>
    </div>
  )
}
