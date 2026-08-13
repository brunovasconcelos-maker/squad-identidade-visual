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
  if (carregando) return <Carregando mensagens={['Abrindo seu manual...']} />

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
        {/* `percentual` é o mesmo valor que decide o texto do banner, para os
            dois não discordarem sobre o manual estar vazio. */}
        <TopBar
          titulo="Identidade Visual"
          onReiniciar={confirmarReinicio}
          manualVazio={percentual === 0}
        />
      </div>

      <div className={s.faixaLarga}>
        {/* Completo, o botão do banner reinicia — a mesma função do menu. */}
        <Banner percentual={percentual} proximo={proximo} onReiniciar={confirmarReinicio} />
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
