import { useEffect, useRef, useState } from 'react'
import Icon from './Icon.jsx'
import s from './TopBar.module.css'

// O "Voltar" ainda não faz nada; o menu de opções já tem o reiniciar.
export default function TopBar({ titulo, onReiniciar }) {
  const [aberto, setAberto] = useState(false)
  const menuRef = useRef(null)

  // Clique fora e Esc fecham o menu.
  useEffect(() => {
    if (!aberto) return undefined

    const aoClicar = (evento) => {
      if (!menuRef.current?.contains(evento.target)) setAberto(false)
    }
    const aoTeclar = (evento) => {
      if (evento.key === 'Escape') setAberto(false)
    }

    document.addEventListener('mousedown', aoClicar)
    document.addEventListener('keydown', aoTeclar)
    return () => {
      document.removeEventListener('mousedown', aoClicar)
      document.removeEventListener('keydown', aoTeclar)
    }
  }, [aberto])

  return (
    <div className={s.barra}>
      <div className={s.esquerda}>
        <button type="button" className={s.voltar} aria-label="Voltar">
          <Icon nome="Arrow-Left" />
        </button>
        <h1 className={s.titulo}>{titulo}</h1>
      </div>

      <div className={s.menu} ref={menuRef}>
        <button
          type="button"
          className={s.opcoes}
          aria-label="Mais opções"
          aria-haspopup="menu"
          aria-expanded={aberto}
          onClick={() => setAberto((estava) => !estava)}
        >
          <Icon nome="More" />
        </button>

        {aberto && (
          <div className={s.lista} role="menu">
            <button
              type="button"
              role="menuitem"
              className={`${s.item} ${s.destrutivo}`}
              onClick={() => {
                setAberto(false)
                onReiniciar?.()
              }}
            >
              Reiniciar manual da marca
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
