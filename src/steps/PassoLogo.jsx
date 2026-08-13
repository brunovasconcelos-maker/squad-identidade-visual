import { useState } from 'react'
import CartaoDeVariacao from '../components/CartaoDeVariacao.jsx'
import Icon from '../components/Icon.jsx'
import ModalVariacao from '../components/ModalVariacao.jsx'
import PassoArquivos from './PassoArquivos.jsx'
import s from './PassoLogo.module.css'

const TITULOS = {
  principal: 'Logo principal',
  preta: 'Logo cor única (preta)',
  branca: 'Logo cor única (branca)',
}

/**
 * Passo da Logo: as três molduras de upload mais as outras variações.
 *
 * A variação é nome, regras de uso e um arquivo, criada pelo modal e listada em
 * cartões abaixo. Não há teto: nenhum quadro do Figma mostra um, e a lista se
 * comporta como a paleta e os tons de voz.
 */
export default function PassoLogo({ arquivos, onSalvar, onRemover, variacoes, acoes }) {
  // null = fechado; { variacao } edita a existente, {} cria uma nova.
  const [modal, setModal] = useState(null)

  const salvarDoModal = (nome, regras, arquivoNovo) => {
    if (modal.variacao) acoes.atualizar(modal.variacao.id, nome, regras, arquivoNovo)
    else acoes.adicionar(nome, regras, arquivoNovo)
    setModal(null)
  }

  return (
    <PassoArquivos
      titulos={TITULOS}
      instrucao="Faça upload ou arraste a logo pra cá"
      arquivos={arquivos}
      onSalvar={onSalvar}
      onRemover={onRemover}
    >
      <div className={s.variacoes}>
        <div className={s.tituloVariacoes}>
          <h2 className={s.titulo}>Outras variações</h2>
          {/* Ainda sem modal de ajuda: por enquanto só o hover. */}
          <button type="button" className={s.ajuda} aria-label="Sobre outras variações">
            <Icon nome="Help" />
          </button>
        </div>

        <button type="button" className={s.adicionar} onClick={() => setModal({})}>
          Adicionar variações
          <Icon nome="Add" />
        </button>
      </div>

      {variacoes.length > 0 && (
        <ul className={s.lista}>
          {variacoes.map((variacao) => (
            <CartaoDeVariacao
              key={variacao.id}
              variacao={variacao}
              onEditar={() => setModal({ variacao })}
              onExcluir={() => acoes.remover(variacao.id)}
            />
          ))}
        </ul>
      )}

      {modal && (
        <ModalVariacao
          variacao={modal.variacao}
          onSalvar={salvarDoModal}
          onFechar={() => setModal(null)}
        />
      )}
    </PassoArquivos>
  )
}
