import s from './ProgressBar.module.css'

/**
 * Trilha de 8px no topo da barra inferior. O preenchimento cresce
 * proporcionalmente: passo 1 = 1/total, último passo = cheio.
 */
export default function ProgressBar({ passo, total }) {
  const porcentagem = (passo / total) * 100

  return (
    <div
      className={s.trilha}
      role="progressbar"
      aria-valuenow={passo}
      aria-valuemin={1}
      aria-valuemax={total}
      aria-label={`Passo ${passo} de ${total}`}
    >
      {/* Os 4px extras compensam o deslocamento negativo que esconde o
          arredondamento da ponta esquerda, como no Figma. */}
      <div className={s.preenchimento} style={{ width: `calc(${porcentagem}% + 4px)` }} />
    </div>
  )
}
