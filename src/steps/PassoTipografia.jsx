import { useEffect, useId, useMemo, useRef, useState } from 'react'
import Icon from '../components/Icon.jsx'
import useFonteDoGoogle from '../hooks/useFonteDoGoogle.js'
import {
  buscarFamilias,
  criarFonte,
  emColunas,
  estiloDaPrevia,
  familiaCss,
  MAXIMO_SECUNDARIAS,
  urlDoCss2,
} from '../lib/googleFonts.js'
import s from './PassoTipografia.module.css'

const ROTULO_VAZIO = 'Selecionar a font da sua marca'

/**
 * Passo de Tipografia.
 *
 * A busca roda sobre o catálogo local do Google Fonts (src/lib/googleFonts.js),
 * e cada card carrega de verdade a fonte escolhida com os pesos marcados. O que
 * foi escolhido fica no estado do fluxo, não aqui: só o "estou buscando" de cada
 * card é local, porque é estado de tela e não conteúdo.
 */
export default function PassoTipografia({ tipografia, acoes }) {
  const { primaria, secundarias } = tipografia

  // O "Adicionar" some ao chegar em três secundárias e fica desabilitado
  // enquanto uma vaga ainda espera escolha — sem isso dá para empilhar vários
  // cards de busca vazios.
  const noLimite = secundarias.length >= MAXIMO_SECUNDARIAS
  const temVagaVazia = secundarias.some((vaga) => !vaga.fonte)

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

        <BotaoMinhaFont />
      </div>

      <div className={s.cartaoPrincipal}>
        <CartaoDeFonte alvo="primaria" fonte={primaria} acoes={acoes} />
      </div>

      <div className={s.cabecalhoSecundarias}>
        <div className={s.tituloGrupo}>
          <h2 className={s.titulo}>Adicionar tipografia secundária</h2>
          <button type="button" className={s.ajuda} aria-label="Sobre a tipografia secundária">
            <Icon nome="Help" />
          </button>
        </div>

        {/* Excluir uma secundária libera a vaga e o botão volta. */}
        {!noLimite && (
          <button
            type="button"
            className={s.botaoContorno}
            disabled={temVagaVazia}
            onClick={acoes.adicionarSecundaria}
          >
            Adicionar
            <Icon nome="Add" />
          </button>
        )}
      </div>

      {secundarias.length > 0 && (
        <div className={s.listaSecundarias}>
          {secundarias.map((vaga) => (
            <div key={vaga.id} className={s.cartao}>
              {/* Nas secundárias o upload da fonte própria fica no próprio
                  card: o lugar dele no cabeçalho já é do "Adicionar". */}
              <CartaoDeFonte
                alvo={vaga.id}
                fonte={vaga.fonte}
                acoes={acoes}
                comBotaoDeUpload
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Um card, nos três estados: vazio, buscando e preenchido. O lápis volta para a
 * busca com o nome atual preenchido; a lixeira chama `removerFonte`, que na
 * primária esvazia o card e na secundária tira o card da lista.
 */
function CartaoDeFonte({ alvo, fonte, acoes, comBotaoDeUpload = false }) {
  const [buscando, setBuscando] = useState(false)

  // Recarrega sozinho quando um peso é marcado ou desmarcado: a URL muda junto.
  useFonteDoGoogle(urlDoCss2(fonte))

  if (buscando) {
    return (
      <BuscaDeFonte
        inicial={fonte?.familia ?? ''}
        comBotaoDeUpload={comBotaoDeUpload}
        onEscolher={(familia) => {
          acoes.definirFonte(alvo, criarFonte(familia))
          setBuscando(false)
        }}
        onCancelar={() => setBuscando(false)}
      />
    )
  }

  if (!fonte) {
    return (
      <div className={s.linhaVaziaGrupo}>
        <button type="button" className={s.linhaVazia} onClick={() => setBuscando(true)}>
          <span className={s.grupoFonte}>
            <span className={s.previa}>Aa</span>
            <span className={s.rotuloVazio}>{ROTULO_VAZIO}</span>
          </span>
          <Icon nome="Search" />
        </button>
        {comBotaoDeUpload && <BotaoMinhaFont />}
      </div>
    )
  }

  const familia = familiaCss(fonte)
  const previa = estiloDaPrevia(fonte)

  return (
    <>
      <div className={s.linha}>
        <div className={s.grupoFonte}>
          <span className={s.previa} style={{ fontFamily: familia, ...previa }}>
            Aa
          </span>
          <span className={s.nomes}>
            <span className={s.nome} style={{ fontFamily: familia, ...previa }}>
              {fonte.familia}
            </span>
            <span className={s.origem}>{fonte.origem}</span>
          </span>
        </div>

        <div className={s.acoes}>
          <button
            type="button"
            className={s.acao}
            onClick={() => setBuscando(true)}
            aria-label={`Trocar a fonte ${fonte.familia}`}
          >
            <Icon nome="Edit" />
          </button>
          <button
            type="button"
            className={`${s.acao} ${s.destrutiva}`}
            onClick={() => acoes.removerFonte(alvo)}
            aria-label={`Excluir a fonte ${fonte.familia}`}
          >
            <Icon nome="Delete" />
          </button>
        </div>
      </div>

      <div className={s.variantes}>
        {emColunas(fonte.variantes).map((coluna) => (
          <div key={coluna[0].chave} className={s.colunaVariantes}>
            {coluna.map((variante) => (
              <label key={variante.chave} className={s.variante}>
                <input
                  type="checkbox"
                  className={s.caixaNativa}
                  checked={variante.marcado}
                  onChange={() => acoes.alternarVariante(alvo, variante.chave)}
                />
                <Icon nome={variante.marcado ? 'Check' : 'Check-Empt'} />
                <span className={s.rotuloVariante}>{variante.rotulo}</span>
              </label>
            ))}
          </div>
        ))}
      </div>
    </>
  )
}

/** O upload de fonte própria, que ainda não faz nada. Visível e desabilitado. */
function BotaoMinhaFont() {
  return (
    <button type="button" className={s.botaoContorno} disabled>
      Adicionar minha font
      <Icon nome="File-Upload" />
    </button>
  )
}

/** Campo de busca no lugar do rótulo, com a lista de resultados logo abaixo. */
function BuscaDeFonte({ inicial, comBotaoDeUpload, onEscolher, onCancelar }) {
  const [texto, setTexto] = useState(inicial)
  const [ativo, setAtivo] = useState(0)
  const campo = useRef(null)
  const lista = useRef(null)
  const idDaLista = useId()

  const resultados = useMemo(() => buscarFamilias(texto), [texto])

  // Vindo do lápis o campo já tem o nome atual: selecionar tudo deixa digitar
  // por cima sem precisar apagar antes.
  useEffect(() => {
    campo.current?.select()
  }, [])

  useEffect(() => {
    lista.current?.children[ativo]?.scrollIntoView({ block: 'nearest' })
  }, [ativo])

  const aoTeclar = (evento) => {
    if (evento.key === 'ArrowDown') {
      evento.preventDefault()
      setAtivo((i) => Math.min(i + 1, resultados.length - 1))
    } else if (evento.key === 'ArrowUp') {
      evento.preventDefault()
      setAtivo((i) => Math.max(i - 1, 0))
    } else if (evento.key === 'Enter') {
      evento.preventDefault()
      if (resultados[ativo]) onEscolher(resultados[ativo])
    } else if (evento.key === 'Escape') {
      evento.preventDefault()
      onCancelar()
    }
  }

  return (
    <div className={s.busca}>
      <div className={s.linhaBusca}>
        <span className={s.previa}>Aa</span>
        {/* eslint-disable-next-line jsx-a11y/no-autofocus -- o campo só existe depois de um clique */}
        <input
          ref={campo}
          autoFocus
          type="text"
          className={s.campo}
          value={texto}
          placeholder={ROTULO_VAZIO}
          role="combobox"
          aria-expanded="true"
          aria-controls={idDaLista}
          aria-autocomplete="list"
          aria-activedescendant={resultados[ativo] ? `${idDaLista}-${ativo}` : undefined}
          aria-label="Buscar uma fonte no Google Fonts"
          onChange={(evento) => {
            setTexto(evento.target.value)
            setAtivo(0)
          }}
          onKeyDown={aoTeclar}
          onBlur={onCancelar}
        />
        {/* A lupa e o upload andam juntos para o gap de 40px da linha ficar
            entre o campo e o par, não entre os dois. */}
        <span className={s.acoesDaBusca}>
          <Icon nome="Search" />
          {comBotaoDeUpload && <BotaoMinhaFont />}
        </span>
      </div>

      <ul
        ref={lista}
        id={idDaLista}
        className={s.lista}
        role="listbox"
        aria-label="Fontes do Google Fonts"
      >
        {resultados.length === 0 ? (
          <li role="presentation" className={s.semResultado}>
            Nenhuma fonte encontrada
          </li>
        ) : (
          resultados.map((familia, i) => (
            <li
              key={familia.familia}
              id={`${idDaLista}-${i}`}
              role="option"
              aria-selected={i === ativo}
              className={i === ativo ? `${s.opcao} ${s.opcaoAtiva}` : s.opcao}
              // Sem isto o clique tira o foco do campo e o onBlur cancela a
              // busca antes do onClick chegar.
              onMouseDown={(evento) => evento.preventDefault()}
              onMouseMove={() => setAtivo(i)}
              onClick={() => onEscolher(familia)}
            >
              <span className={s.nomeOpcao}>{familia.familia}</span>
              <span className={s.categoriaOpcao}>{familia.categoria}</span>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}
