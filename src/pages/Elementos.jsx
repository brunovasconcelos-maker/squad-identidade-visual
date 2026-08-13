import CartaoDeElemento, { AcaoDoCartao } from '../components/CartaoDeElemento.jsx'
import Icon from '../components/Icon.jsx'
import PaginaDoTema from '../components/PaginaDoTema.jsx'
import useManual from '../hooks/useManual.js'
import s from './Elementos.module.css'

/*
 * Página de leitura dos elementos adicionais — node 6217:6288 do Figma.
 *
 * A mesma linha da lista de "Adicionados" do passo, com o lápis e a lixeira
 * trocados por um download só: aqui não se edita nem se exclui, quem faz isso
 * é o "Editar" do topo.
 */
export default function Elementos() {
  const { manual, carregando } = useManual()
  const elementos = manual?.elementos ?? []

  return (
    <PaginaDoTema
      titulo="Elementos adicionais"
      slug="elementos"
      carregando={carregando}
      temConteudo={elementos.length > 0}
      vazio="Nada adicionado ainda. Envie arquivos adicionais para vê-los aqui."
    >
      <ul className={s.lista}>
        {elementos.map((elemento) => (
          <CartaoDeElemento key={elemento.id} elemento={elemento}>
            {/* O `href` é a object URL dos bytes gravados no IndexedDB, e o
                `download` devolve o nome original do arquivo — é o arquivo
                mesmo que a pessoa enviou, não uma cópia remontada.

                Sem arquivo não há o que baixar; a linha fica sem a ação em vez
                de oferecer um botão que não faz nada. */}
            {elemento.arquivo?.url && (
              <AcaoDoCartao
                como="a"
                href={elemento.arquivo.url}
                download={elemento.arquivo.nome}
                aria-label={`Baixar ${elemento.arquivo.nome}`}
              >
                <Icon nome="Download-Simple" />
              </AcaoDoCartao>
            )}
          </CartaoDeElemento>
        ))}
      </ul>
    </PaginaDoTema>
  )
}
