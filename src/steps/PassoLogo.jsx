import Icon from '../components/Icon.jsx'
import UploadLogo from '../components/UploadLogo.jsx'
import s from './PassoLogo.module.css'

export default function PassoLogo({ logos, onSalvar }) {
  return (
    <div className={s.passo}>
      <UploadLogo
        titulo="Logo principal"
        logo={logos.principal}
        onArquivo={(arquivo) => onSalvar('principal', arquivo)}
      />

      <div className={s.par}>
        <UploadLogo
          titulo="Logo cor única (preta)"
          logo={logos.preta}
          onArquivo={(arquivo) => onSalvar('preta', arquivo)}
        />
        <UploadLogo
          titulo="Logo cor única (branca)"
          logo={logos.branca}
          fundo="escuro"
          onArquivo={(arquivo) => onSalvar('branca', arquivo)}
        />
      </div>

      <div className={s.variacoes}>
        <div className={s.tituloVariacoes}>
          <h2 className={s.titulo}>Outras variações</h2>
          {/* Ainda sem modal: por enquanto só o hover. */}
          <button type="button" className={s.ajuda} aria-label="Sobre outras variações">
            <Icon nome="Help" />
          </button>
        </div>

        <button type="button" className={s.adicionar}>
          Adicionar variações
          <Icon nome="Add" />
        </button>
      </div>
    </div>
  )
}
