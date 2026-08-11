import s from './PassoTomDeVoz.module.css'

/**
 * Passo de Tom de Voz — só o lugar, por enquanto.
 *
 * Não há campo nem modelo de dados ainda, então o passo nunca fica preenchido:
 * "Continuar" segue desabilitado e o "Não tenho, pular" continua na tela. Isso
 * não é exceção no código — cai direto da regra `mostrarPular = !temConteudo`,
 * já que `conteudoDoPilar` não declara nada para este slug.
 */
export default function PassoTomDeVoz() {
  return (
    <div className={s.passo}>
      <h2 className={s.titulo}>Tom de Voz</h2>
      <p className={s.aviso}>Em breve</p>
    </div>
  )
}
