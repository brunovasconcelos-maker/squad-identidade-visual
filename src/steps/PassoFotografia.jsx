import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import {
  CATEGORIAS,
  categoriasEscolhidas,
  MAXIMO_POR_CATEGORIA,
  NUMEROS_DE_FOTO,
} from '../data/fotografia.js'
import { urlDaFoto } from '../lib/imagens.js'
import s from './PassoFotografia.module.css'

/**
 * Passo de Fotografia — duas telas dentro do mesmo passo do fluxo.
 *
 * A tela atual e as escolhas moram no estado do fluxo, não aqui: voltando do
 * passo seguinte, a pessoa precisa cair de novo no resumo se era ali que
 * estava. A barra de progresso só anda no "Continuar" do resumo, e quem cuida
 * disso é o PassoAPasso.
 *
 * A aba aberta também vive no estado do fluxo: o "Continuar" da barra inferior
 * caminha por elas em ordem, então quem manda na aba está fora deste
 * componente. Clicar direto numa aba continua funcionando.
 */
export default function PassoFotografia({ fotografia, acoes }) {
  const { selecoes, tela, aba } = fotografia

  return (
    <div className={s.passo}>
      <div className={s.cabecalho}>
        <div className={s.tituloGrupo}>
          <h2 className={s.titulo}>Estilo de Fotografia</h2>
          {/* Ainda sem modal de ajuda: por enquanto só o hover. */}
          <button type="button" className={s.ajuda} aria-label="Sobre o estilo de fotografia">
            <Icon nome="Help" />
          </button>
        </div>
      </div>

      {tela === 'resumo' ? (
        <Resumo selecoes={selecoes} onAlternar={acoes.alternarFoto} />
      ) : (
        <Selecao
          selecoes={selecoes}
          aba={aba}
          onTrocarAba={acoes.irParaAba}
          onAlternar={acoes.alternarFoto}
        />
      )}
    </div>
  )
}

/** Tela 1: abas de categoria e a grade 3x3 da categoria aberta. */
function Selecao({ selecoes, aba, onTrocarAba, onAlternar }) {
  // Guarda a foto que acabou de ser recusada por limite, só para a sacudida.
  const [recusada, setRecusada] = useState(null)

  const categoria = CATEGORIAS.find((c) => c.id === aba) ?? CATEGORIAS[0]
  const escolhidas = selecoes[categoria.id] ?? []
  const cheia = escolhidas.length >= MAXIMO_POR_CATEGORIA

  const clicar = (numero) => {
    if (!escolhidas.includes(numero) && cheia) {
      setRecusada(numero)
      return
    }
    onAlternar(categoria.id, numero)
  }

  return (
    <>
      <div className={s.abas} role="tablist" aria-label="Categorias de fotografia">
        {CATEGORIAS.map((item) => {
          const ativa = item.id === categoria.id
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={ativa}
              className={ativa ? `${s.aba} ${s.abaAtiva}` : s.aba}
              onClick={() => onTrocarAba(item.id)}
            >
              {item.nome}
            </button>
          )
        })}
      </div>

      <div className={s.grade}>
        {NUMEROS_DE_FOTO.map((numero) => (
          <Foto
            key={numero}
            categoria={categoria}
            numero={numero}
            selecionada={escolhidas.includes(numero)}
            // Só desenha a sacudida na foto recusada, e uma vez por clique.
            recusada={recusada === numero}
            onClick={() => clicar(numero)}
            onFimDaRecusa={() => setRecusada(null)}
          />
        ))}
      </div>
    </>
  )
}

/** Tela 2: só as categorias que têm foto escolhida. Clicar remove. */
function Resumo({ selecoes, onAlternar }) {
  const categorias = categoriasEscolhidas(selecoes)

  return (
    <div className={s.lista}>
      {categorias.map((categoria) => (
        <section key={categoria.id} className={s.categoria}>
          <h3 className={s.nomeDaCategoria}>{categoria.nome}</h3>

          {/* Mesma grade de três colunas da seleção, para uma foto sozinha
              ficar do mesmo tamanho que as da grade. */}
          <div className={s.fotosDaCategoria}>
            {selecoes[categoria.id].map((numero) => (
              <Foto
                key={numero}
                categoria={categoria}
                numero={numero}
                selecionada
                noResumo
                onClick={() => onAlternar(categoria.id, numero)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

function Foto({ categoria, numero, selecionada, recusada, noResumo, onClick, onFimDaRecusa }) {
  const url = urlDaFoto(categoria.prefixo, numero)
  const classes = [s.foto]
  if (selecionada) classes.push(s.fotoSelecionada)
  if (recusada) classes.push(s.recusada)

  return (
    <button
      type="button"
      className={classes.join(' ')}
      aria-pressed={selecionada}
      aria-label={
        noResumo
          ? `Remover a foto ${numero} de ${categoria.nome}`
          : `Foto ${numero} de ${categoria.nome}`
      }
      onClick={onClick}
      onAnimationEnd={onFimDaRecusa}
    >
      <img className={s.imagem} src={url} alt="" loading="lazy" />
      {selecionada && (
        <span className={s.selo}>
          <Icon nome="Check-Circle" />
        </span>
      )}
    </button>
  )
}
