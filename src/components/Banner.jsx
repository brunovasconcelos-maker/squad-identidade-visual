import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import tom from '../assets/imagens/tom.svg'
import s from './Banner.module.css'

export default function Banner() {
  const navigate = useNavigate()
  // Passar o mouse (ou dar foco pelo teclado) no botão balança o Tom.
  const [balancando, setBalancando] = useState(false)

  const ativar = () => setBalancando(true)
  const desativar = () => setBalancando(false)

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
        <p className={s.texto}>
          Você ainda não começou a preencher seu manual de marca.
        </p>
      </div>

      <button
        type="button"
        className={s.botao}
        onClick={() => navigate('/passo-a-passo')}
        onMouseEnter={ativar}
        onMouseLeave={desativar}
        onFocus={ativar}
        onBlur={desativar}
      >
        Começar
      </button>
    </div>
  )
}
