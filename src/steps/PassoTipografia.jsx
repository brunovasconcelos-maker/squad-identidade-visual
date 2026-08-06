import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import {
  emColunas,
  FONTE_PRIMARIA_EXEMPLO,
  FONTE_SECUNDARIA_EXEMPLO,
  MAXIMO_SECUNDARIAS,
} from '../data/fontesMock.js'
import s from './PassoTipografia.module.css'

let proximoId = 0
const novoSlot = () => ({ id: `secundaria-${proximoId++}`, fonte: null })

/**
 * Passo de Tipografia — só interface, com dados mockados.
 *
 * Ainda não existe busca no Google Fonts: clicar num card vazio "seleciona"
 * a fonte de exemplo, só para demonstrar o layout preenchido. Os checkboxes
 * das variantes alternam de verdade, mas sobre esses mesmos dados.
 */
export default function PassoTipografia() {
  const [primaria, setPrimaria] = useState(null)
  const [secundarias, setSecundarias] = useState([])

  const alternarVariantePrimaria = (indice) => {
    setPrimaria((atual) => ({ ...atual, variantes: alternar(atual.variantes, indice) }))
  }

  const alternarVarianteSecundaria = (id, indice) => {
    setSecundarias((atual) =>
      atual.map((slot) =>
        slot.id === id && slot.fonte
          ? { ...slot, fonte: { ...slot.fonte, variantes: alternar(slot.fonte.variantes, indice) } }
          : slot,
      ),
    )
  }

  const selecionarSecundaria = (id) => {
    setSecundarias((atual) =>
      atual.map((slot) =>
        slot.id === id ? { ...slot, fonte: clonar(FONTE_SECUNDARIA_EXEMPLO) } : slot,
      ),
    )
  }

  const podeAdicionar = secundarias.length < MAXIMO_SECUNDARIAS

  return (
    <div className={s.passo}>
      <div className={s.cabecalho}>
        <div className={s.tituloGrupo}>
          <h2 className={s.titulo}>Tipografia da Marca</h2>
          {/* Ainda sem modal de ajuda: por enquanto só o hover. */}
          <button type="button" className={s.ajuda} aria-label="Sobre a tipografia da marca">
            <Icon nome="Help" />
          </button>
        </div>

        {/* Upload de fonte própria entra depois. */}
        <button type="button" className={s.botaoContorno} disabled>
          Adicionar minha font
          <Icon nome="File-Upload" />
        </button>
      </div>

      <div className={s.cartaoPrincipal}>
        {primaria ? (
          <CartaoDeFonte
            fonte={primaria}
            onTrocar={() => setPrimaria(null)}
            onExcluir={() => setPrimaria(null)}
            onAlternar={alternarVariantePrimaria}
          />
        ) : (
          <CartaoVazio
            rotulo="Selecionar a font da sua marca"
            onSelecionar={() => setPrimaria(clonar(FONTE_PRIMARIA_EXEMPLO))}
          />
        )}
      </div>

      <div className={s.cabecalhoSecundarias}>
        <div className={s.tituloGrupo}>
          <h2 className={s.titulo}>Adicionar tipografia secundária</h2>
          <button
            type="button"
            className={s.ajuda}
            aria-label="Sobre a tipografia secundária"
          >
            <Icon nome="Help" />
          </button>
        </div>

        {/* Some ao chegar em três secundárias; excluir uma libera a vaga. */}
        {podeAdicionar && (
          <button
            type="button"
            className={s.botaoContorno}
            onClick={() => setSecundarias((atual) => [...atual, novoSlot()])}
          >
            Adicionar
            <Icon nome="Add" />
          </button>
        )}
      </div>

      {secundarias.length > 0 && (
        <div className={s.listaSecundarias}>
          {secundarias.map((slot) => (
            <div key={slot.id} className={s.cartao}>
              {slot.fonte ? (
                <CartaoDeFonte
                  fonte={slot.fonte}
                  onTrocar={() =>
                    setSecundarias((atual) =>
                      atual.map((s2) => (s2.id === slot.id ? { ...s2, fonte: null } : s2)),
                    )
                  }
                  onExcluir={() =>
                    setSecundarias((atual) => atual.filter((s2) => s2.id !== slot.id))
                  }
                  onAlternar={(indice) => alternarVarianteSecundaria(slot.id, indice)}
                />
              ) : (
                <CartaoVazio
                  rotulo="Selecionar a font da sua marca"
                  onSelecionar={() => selecionarSecundaria(slot.id)}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function CartaoVazio({ rotulo, onSelecionar }) {
  return (
    <button type="button" className={s.linhaVazia} onClick={onSelecionar}>
      <span className={s.grupoFonte}>
        <span className={s.previa}>Aa</span>
        <span className={s.rotuloVazio}>{rotulo}</span>
      </span>
      <Icon nome="Search" />
    </button>
  )
}

function CartaoDeFonte({ fonte, onTrocar, onExcluir, onAlternar }) {
  const colunas = emColunas(fonte.variantes, fonte.colunas)
  const porColuna = Math.ceil(fonte.variantes.length / fonte.colunas)

  return (
    <>
      <div className={s.linha}>
        <div className={s.grupoFonte}>
          {/* A fonte real ainda não é carregada, então a prévia cai na fonte
              do projeto até a busca existir. */}
          <span className={s.previa} style={{ fontFamily: `'${fonte.nome}', var(--fonte)` }}>
            Aa
          </span>
          <span className={s.nomes}>
            <span className={s.nome} style={{ fontFamily: `'${fonte.nome}', var(--fonte)` }}>
              {fonte.nome}
            </span>
            <span className={s.origem}>{fonte.origem}</span>
          </span>
        </div>

        <div className={s.acoes}>
          <button
            type="button"
            className={s.acao}
            onClick={onTrocar}
            aria-label={`Trocar a fonte ${fonte.nome}`}
          >
            <Icon nome="Edit" />
          </button>
          <button
            type="button"
            className={`${s.acao} ${s.destrutiva}`}
            onClick={onExcluir}
            aria-label={`Excluir a fonte ${fonte.nome}`}
          >
            <Icon nome="Delete" />
          </button>
        </div>
      </div>

      <div className={s.variantes}>
        {colunas.map((coluna, iColuna) => (
          <div key={iColuna} className={s.colunaVariantes}>
            {coluna.map((variante, iLinha) => {
              const indice = iColuna * porColuna + iLinha
              return (
                <label key={variante.rotulo} className={s.variante}>
                  <input
                    type="checkbox"
                    className={s.caixaNativa}
                    checked={variante.marcado}
                    onChange={() => onAlternar(indice)}
                  />
                  <Icon nome={variante.marcado ? 'Check' : 'Check-Empt'} />
                  <span className={s.rotuloVariante}>{variante.rotulo}</span>
                </label>
              )
            })}
          </div>
        ))}
      </div>
    </>
  )
}

function alternar(variantes, indice) {
  return variantes.map((variante, i) =>
    i === indice ? { ...variante, marcado: !variante.marcado } : variante,
  )
}

function clonar(fonte) {
  return { ...fonte, variantes: fonte.variantes.map((v) => ({ ...v })) }
}
