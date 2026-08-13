import { Miniatura } from './ModalElemento.jsx'
import s from './CartaoDeElemento.module.css'

/**
 * A linha de um elemento salvo: a prévia, o nome dado pela pessoa e o nome do
 * arquivo, com as ações à direita.
 *
 * Mesma linha na lista de "Adicionados" do passo e na página de leitura — o
 * que muda entre as duas é só o que vai em `children`: lá o lápis e a lixeira,
 * aqui o download. Medidas do node 6217:6288 do Figma, que são as mesmas do
 * passo: caixa de 12px com 28px à direita, 40px entre a prévia e os textos.
 */
export default function CartaoDeElemento({ elemento, children }) {
  return (
    <li className={s.cartao}>
      <div className={s.grupo}>
        <Miniatura arquivo={elemento.arquivo} />

        {/* Lado a lado na largura do desenho; em celular a caixa vira coluna e
            os dois textos deixam de disputar a mesma linha. */}
        <div className={s.textos}>
          <span className={s.nome}>{elemento.nome}</span>
          <span className={s.arquivo}>{elemento.arquivo?.nome}</span>
        </div>
      </div>

      <div className={s.acoes}>{children}</div>
    </li>
  )
}

/**
 * Uma ação do cartão: 32px de área clicável em volta do ícone de 24px.
 *
 * `como` existe porque nem toda ação é um botão — o download é um `<a>` com
 * `download`, que é o que baixa o arquivo sem JavaScript no meio.
 */
export function AcaoDoCartao({ como: Elemento = 'button', destrutiva = false, ...props }) {
  return <Elemento className={destrutiva ? `${s.acao} ${s.destrutiva}` : s.acao} {...props} />
}
