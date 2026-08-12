import ProgressBar from './ProgressBar.jsx'
import s from './FlowBottomBar.module.css'

/**
 * A barra inferior do fluxo.
 *
 * Serve aos dois modos: o fluxo completo, que caminha entre temas e mostra a
 * barra de progresso, e a edição avulsa de um tema só, que esconde o progresso
 * e troca o "Continuar" por um "Salvar".
 */
export default function FlowBottomBar({
  passo,
  total,
  temConteudo,
  mostrarPular = true,
  mostrarProgresso = true,
  rotulo,
  ocupado = false,
  onVoltar,
  onPular,
  onContinuar,
}) {
  const ultimoPasso = passo === total
  const rotuloPrincipal = rotulo ?? (ultimoPasso ? 'Finalizar' : 'Continuar')

  return (
    <footer className={s.barra}>
      {/* Sem próximo tema não há progresso a mostrar. */}
      {mostrarProgresso && <ProgressBar passo={passo} total={total} />}

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

          {/* No último passo o botão finaliza o manual, não avança. Na edição
              avulsa o rótulo vem de fora e ele salva o tema. */}
          <button
            type="button"
            className={s.continuar}
            onClick={onContinuar}
            disabled={!temConteudo || ocupado}
          >
            {ocupado ? (
              <>
                <span className={s.girando} aria-hidden="true" />
                Salvando...
              </>
            ) : (
              rotuloPrincipal
            )}
          </button>
        </div>
      </div>
    </footer>
  )
}
