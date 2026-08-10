import Icon from '../components/Icon.jsx'
import PassoArquivos from './PassoArquivos.jsx'
import s from './PassoLogo.module.css'

const TITULOS = {
  principal: 'Logo principal',
  preta: 'Logo cor única (preta)',
  branca: 'Logo cor única (branca)',
}

export default function PassoLogo({ arquivos, onSalvar, onRemover }) {
  return (
    <PassoArquivos
      titulos={TITULOS}
      instrucao="Faça upload ou arraste a logo pra cá"
      arquivos={arquivos}
      onSalvar={onSalvar}
      onRemover={onRemover}
    >
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
    </PassoArquivos>
  )
}
