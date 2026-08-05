import ProgressBar from './ProgressBar.jsx'
import s from './FlowBottomBar.module.css'

export default function FlowBottomBar({
  passo,
  total,
  temConteudo,
  onVoltar,
  onPular,
  onContinuar,
}) {
  const ultimoPasso = passo === total

  return (
    <footer className={s.barra}>
      <ProgressBar passo={passo} total={total} />

      <div className={s.acoes}>
        <button type="button" className={s.voltar} onClick={onVoltar}>
          Voltar
        </button>

        <div className={s.direita}>
          <button type="button" className={s.pular} onClick={onPular}>
            {ultimoPasso ? 'Não tenho, pular e finalizar' : 'Não tenho, pular'}
          </button>

          {/* temConteudo ainda é um placeholder: sem conteúdo por passo, o
              botão fica sempre desabilitado. Entra na lógica do formulário. */}
          <button
            type="button"
            className={s.continuar}
            onClick={onContinuar}
            disabled={!temConteudo}
          >
            Continuar
          </button>
        </div>
      </div>
    </footer>
  )
}
