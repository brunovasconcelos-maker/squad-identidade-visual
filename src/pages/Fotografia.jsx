import PaginaDoTema from '../components/PaginaDoTema.jsx'
import useManual from '../hooks/useManual.js'
import { categoriasEscolhidas } from '../data/fotografia.js'
import { urlDaFoto } from '../lib/imagens.js'
import s from './Fotografia.module.css'

/*
 * Página de leitura da Fotografia — node 6206:5331 do Figma.
 *
 * O mesmo agrupamento do resumo do passo: um bloco por categoria com ao menos
 * uma foto, o nome da categoria em cima e as escolhidas embaixo. Categoria sem
 * foto não aparece.
 *
 * A diferença para o resumo do fluxo é que aqui não há seleção: as miniaturas
 * são só imagens, sem a borda preta e sem o selo de conferido, que lá dizem
 * "esta está marcada". Quem edita vai pelo "Editar" do topo.
 */
export default function Fotografia() {
  const { manual, carregando } = useManual()
  const selecoes = manual?.fotografia?.selecoes ?? {}
  const categorias = categoriasEscolhidas(selecoes)

  return (
    <PaginaDoTema
      titulo="Fotografia"
      slug="fotografia"
      carregando={carregando}
      temConteudo={categorias.length > 0}
      vazio="Nada adicionado ainda. Escolha fotos de referência para vê-las aqui."
    >
      <div className={s.categorias}>
        {categorias.map((categoria) => (
          <section key={categoria.id} className={s.categoria}>
            <h2 className={s.titulo}>{categoria.nome}</h2>

            <div className={s.fotos}>
              {selecoes[categoria.id].map((numero) => (
                <img
                  key={numero}
                  className={s.foto}
                  src={urlDaFoto(categoria.prefixo, numero)}
                  alt={`${categoria.nome} ${numero}`}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </PaginaDoTema>
  )
}
