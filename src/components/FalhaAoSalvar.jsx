import s from './Carregando.module.css'

/**
 * Quando a gravação falha.
 *
 * Existe porque o contrário — voltar para a Home mesmo assim — mostraria uma
 * Home vazia, exatamente igual à de quem nunca preencheu nada. Falhar calado
 * aqui é indistinguível de ter dado certo, então a falha aparece.
 */
export default function FalhaAoSalvar({ erro, onTentarDeNovo, onDescartar }) {
  return (
    <div className={s.tela} role="alert">
      <p className={s.titulo}>Não foi possível salvar seu manual.</p>
      <p className={s.mensagem}>
        O que você preencheu continua aqui. Se sair agora, ele será perdido.
      </p>
      {erro?.message && <p className={s.detalhe}>{erro.message}</p>}

      <div className={s.acoes}>
        <button type="button" className={s.principal} onClick={onTentarDeNovo}>
          Tentar de novo
        </button>
        <button type="button" className={s.secundario} onClick={onDescartar}>
          Sair sem salvar
        </button>
      </div>
    </div>
  )
}
