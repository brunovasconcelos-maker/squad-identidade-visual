import { useEffect, useRef, useState } from 'react'
import Icon from '../components/Icon.jsx'
import PaginaDoTema from '../components/PaginaDoTema.jsx'
import useManual from '../hooks/useManual.js'
import { niveisDeContraste } from '../lib/cor.js'
import s from './PaletaDeCores.module.css'

/*
 * Página de leitura da Paleta de Cores — node 6178:2788 do Figma.
 *
 * Uma seção por cor salva: o nome, a amostra da âncora ocupando a coluna
 * inteira, o rótulo dela e a fileira com a escala de tons. Cada amostra traz
 * os selos de contraste, que dizem em que nível do WCAG um texto branco ou
 * preto lê por cima dela.
 *
 * Tudo sai do que já foi salvo (useManual); não há modelo de dados novo.
 */
export default function PaletaDeCores() {
  const { manual, carregando } = useManual()
  const cores = manual?.paleta ?? []

  return (
    <PaginaDoTema
      titulo="Paleta de Cores"
      slug="paleta-de-cores"
      carregando={carregando}
      temConteudo={cores.length > 0}
      vazio="Nada adicionado ainda. Escolha as cores da marca para ver a paleta aqui."
    >
      {cores.map((cor) => (
        <Cor key={cor.id} cor={cor} />
      ))}
    </PaginaDoTema>
  )
}

function Cor({ cor }) {
  // A âncora é o hex que a pessoa escolheu; ela também aparece na fileira, no
  // degrau dela, e é assim no Figma.
  const ancora = cor.tons.find((tom) => tom.ancora)

  // Sem nenhum tom além da âncora, a fileira mostraria a mesma cor de novo,
  // logo abaixo do bloco grande. Aí não há escala para mostrar.
  const temEscala = cor.tons.length > 1

  return (
    <section className={s.cor}>
      <h2 className={s.nome}>
        {cor.nome}
        {cor.principal && (
          <span className={s.estrela}>
            <Icon nome="Star-Filled" tamanho={20} />
            <span className={s.somenteLeitor}>Cor principal da marca</span>
          </span>
        )}
      </h2>

      {ancora && (
        <>
          <Amostra hex={ancora.hex} />
          <Rotulo passo={ancora.passo} hex={ancora.hex} />
        </>
      )}

      {/* Do escuro para o claro, como no Figma. `cor.tons` vem na ordem
          contrária (PASSOS_DE_TOM começa no 95), que é a que o passo de Paleta
          mostra — aqui a fileira é invertida só na exibição. */}
      {temEscala && (
        <div className={s.tons}>
          {[...cor.tons].reverse().map((tom) => (
            <div key={tom.passo} className={s.tom}>
              <Amostra hex={tom.hex} />
              <Rotulo passo={tom.passo} hex={tom.hex} />
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

/** Quanto tempo o "Copiado" fica antes de voltar ao rótulo normal. */
const TEMPO_DO_COPIADO = 2000

/**
 * Uma amostra de cor, que copia o hex ao ser clicada.
 *
 * A dica segue o cursor dentro da amostra, porque a amostra grande tem 808px
 * de largura — uma dica fixa num canto ficaria longe de onde a pessoa clicou.
 */
function Amostra({ hex }) {
  const niveis = niveisDeContraste(hex)
  const [cursor, setCursor] = useState(null)
  const [copiado, setCopiado] = useState(false)
  const relogio = useRef(null)

  useEffect(() => () => clearTimeout(relogio.current), [])

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(`#${hex}`)
    } catch {
      // Sem permissão ou fora de contexto seguro: não anuncia o que não fez.
      return
    }

    setCopiado(true)
    clearTimeout(relogio.current)
    relogio.current = setTimeout(() => setCopiado(false), TEMPO_DO_COPIADO)
  }

  const sair = () => {
    setCursor(null)
    // Saindo com o mouse a dica some junto, inclusive a de "Copiado".
    clearTimeout(relogio.current)
    setCopiado(false)
  }

  return (
    <button
      type="button"
      className={s.amostra}
      style={{ backgroundColor: `#${hex}` }}
      aria-label={`Copiar o hex #${hex}`}
      onClick={copiar}
      onMouseMove={(evento) => {
        const caixa = evento.currentTarget.getBoundingClientRect()
        setCursor({ x: evento.clientX - caixa.left, y: evento.clientY - caixa.top })
      }}
      onMouseLeave={sair}
    >
      {niveis.length > 0 && (
        <span className={s.selos}>
          {niveis.map(({ texto, nivel }) => (
            // A cor do selo é a do texto que passa, e o quadrado herda dela
            // pelo currentcolor.
            <span key={texto} className={s.selo} style={{ color: `#${texto}` }}>
              <span className={s.quadrado} />
              {nivel}
            </span>
          ))}
        </span>
      )}

      {cursor && (
        <span
          className={copiado ? `${s.dica} ${s.dicaCopiado}` : s.dica}
          style={{ left: cursor.x, top: cursor.y }}
          aria-hidden="true"
        >
          {copiado && <Icon nome="Check" tamanho={16} />}
          {copiado ? 'Copiado' : 'Copiar Hex'}
        </span>
      )}

      {/* O aviso para quem não vê a dica. */}
      <span role="status" className={s.somenteLeitor}>
        {copiado ? `#${hex} copiado` : ''}
      </span>
    </button>
  )
}

function Rotulo({ passo, hex }) {
  return (
    <div className={s.rotulo}>
      <span className={s.passo}>{passo}</span>
      <span className={s.hex}>#{hex}</span>
    </div>
  )
}
