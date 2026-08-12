import PaginaDoTema from '../components/PaginaDoTema.jsx'
import { Miniatura } from '../components/ModalElemento.jsx'
import useManual from '../hooks/useManual.js'
import s from './Elementos.module.css'

/**
 * Visão de leitura dos elementos adicionais.
 *
 * Último tema ainda sem desenho próprio no Figma: por ora é a lista do que foi
 * gravado, com a prévia, o nome dado e o nome do arquivo. A casca (topo,
 * coluna e vazio) é a mesma das páginas já desenhadas.
 */
export default function Elementos() {
  const { manual, carregando } = useManual()
  const elementos = manual?.elementos ?? []

  return (
    <PaginaDoTema
      titulo="Elementos"
      slug="elementos"
      carregando={carregando}
      temConteudo={elementos.length > 0}
      vazio="Nada adicionado ainda."
    >
      <div className={s.lista}>
        {elementos.map((elemento) => (
          <div key={elemento.id} className={s.elemento}>
            <Miniatura arquivo={elemento.arquivo} />
            <span className={s.nome}>{elemento.nome}</span>
            <span className={s.secundario}>{elemento.arquivo?.nome}</span>
          </div>
        ))}
      </div>
    </PaginaDoTema>
  )
}
