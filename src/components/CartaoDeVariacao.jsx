import { AcaoDoCartao } from './CartaoDeElemento.jsx'
import Icon from './Icon.jsx'
import { Miniatura } from './ModalElemento.jsx'
import s from './CartaoDeVariacao.module.css'

/**
 * A linha de uma variação salva da logo — node 6049:963 do Figma.
 *
 * Mesma ideia do cartão de elemento, mas não é o mesmo cartão: este tem 32px de
 * recuo à direita, 32px entre os textos e 24px entre as ações, contra 28/40/20
 * lá. Os pedaços que os dois têm em comum — a prévia de 64px e o alvo de 32px
 * das ações — vêm dos mesmos componentes; só a medida da linha é daqui.
 */
export default function CartaoDeVariacao({ variacao, onEditar, onExcluir }) {
  return (
    <li className={s.cartao}>
      <div className={s.grupo}>
        <Miniatura arquivo={variacao.arquivo} className={s.previa} />

        <div className={s.textos}>
          <span className={s.nome}>{variacao.nome}</span>
          {variacao.regras && <span className={s.regras}>{variacao.regras}</span>}
        </div>
      </div>

      <div className={s.acoes}>
        <AcaoDoCartao type="button" onClick={onEditar} aria-label={`Editar ${variacao.nome}`}>
          <Icon nome="Edit" />
        </AcaoDoCartao>
        <AcaoDoCartao
          type="button"
          destrutiva
          onClick={onExcluir}
          aria-label={`Excluir ${variacao.nome}`}
        >
          <Icon nome="Delete" />
        </AcaoDoCartao>
      </div>
    </li>
  )
}
