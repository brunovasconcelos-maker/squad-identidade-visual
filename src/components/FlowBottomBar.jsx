import ProgressBar from './ProgressBar.jsx'
import s from './FlowBottomBar.module.css'

export default function FlowBottomBar({
  passo,
  total,
  temConteudo,
  mostrarPular = true,
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
          {/* Some quando o passo já tem conteúdo suficiente — não faz sentido
              oferecer "pular" para quem já preencheu. */}
          {mostrarPular && (
            <button type="button" className={s.pular} onClick={onPular}>
              {ultimoPasso ? 'Não tenho, pular e finalizar' : 'Não tenho, pular'}
            </button>
          )}

          {/* No último passo o botão finaliza o manual, não avança. */}
          <button
            type="button"
            className={s.continuar}
            onClick={onContinuar}
            disabled={!temConteudo}
          >
            {ultimoPasso ? 'Finalizar' : 'Continuar'}
          </button>
        </div>
      </div>
    </footer>
  )
}
