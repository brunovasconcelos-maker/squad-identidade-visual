import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import tom from '../assets/imagens/Tom-Home.png'
import s from './Banner.module.css'

/**
 * O texto e o botão acompanham o quanto do manual já foi preenchido: nada
 * começado, algo pela metade (aí o botão retoma no primeiro tema incompleto)
 * ou tudo pronto.
 *
 * Completo, o botão reinicia o manual — a mesma ação do "Reiniciar manual da
 * marca" do menu de opções, confirmação inclusive, porque quem a implementa é
 * a Home e os dois chamam a mesma função.
 */
export default function Banner({ percentual = 0, proximo = null, onReiniciar }) {
  const navigate = useNavigate()
  // Passar o mouse (ou dar foco pelo teclado) no botão balança o Tom.
  const [balancando, setBalancando] = useState(false)

  const ativar = () => setBalancando(true)
  const desativar = () => setBalancando(false)

  const comecado = percentual > 0
  const completo = percentual === 100

  const mensagem = !comecado
    ? 'Você ainda não começou a preencher seu manual de marca.'
    : completo
      ? 'Você preencheu 100% do seu Manual de Identidade Visual'
      : `Você preencheu ${percentual}% do seu Manual de Identidade Visual`

  const rotulo = !comecado ? 'Começar' : completo ? 'Reiniciar' : 'Continuar'

  // Retoma no primeiro tema que falta; sem nenhum, abre o fluxo do início.
  const destino = proximo ? `/passo-a-passo?passo=${proximo.passo}` : '/passo-a-passo'

  const aoClicar = completo ? onReiniciar : () => navigate(destino)

  return (
    <div className={s.banner}>
      <div className={s.conteudo}>
        <div className={s.slotIlustracao}>
          <img
            src={tom}
            alt=""
            width={107}
            height={128}
            className={[s.ilustracao, balancando && s.balancando].filter(Boolean).join(' ')}
          />
        </div>
        <p className={s.texto}>{mensagem}</p>
      </div>

      <button
        type="button"
        className={s.botao}
        onClick={aoClicar}
        onMouseEnter={ativar}
        onMouseLeave={desativar}
        onFocus={ativar}
        onBlur={desativar}
      >
        {rotulo}
      </button>
    </div>
  )
}
