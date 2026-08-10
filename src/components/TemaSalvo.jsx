import { Link } from 'react-router-dom'
import Carregando from './Carregando.jsx'
import Icon from './Icon.jsx'
import { Miniatura } from './ModalElemento.jsx'
import useManual from '../hooks/useManual.js'
import { temaCompleto } from '../lib/manual.js'
import { TIPOS_ARQUIVO } from '../data/uploads.js'
import { categoriasEscolhidas } from '../data/fotografia.js'
import { EIXOS, POSICOES } from '../data/personalidade.js'
import { urlDaFoto } from '../lib/imagens.js'
import s from './TemaSalvo.module.css'

const ROTULO_DO_ARQUIVO = {
  principal: 'Principal',
  preta: 'Cor única (preta)',
  branca: 'Cor única (branca)',
}

/**
 * Visão de leitura do que foi salvo num tema.
 *
 * É de propósito simples: mostra o conteúdo gravado sem edição nenhuma. O
 * desenho de verdade vem depois; por ora o que importa é conseguir conferir o
 * que está no manual.
 */
export default function TemaSalvo({ titulo, slug }) {
  const { manual, carregando } = useManual()

  if (carregando) return <Carregando mensagens={['Abrindo seu manual...']} />

  const temAlgo = temaCompleto(manual, slug)

  return (
    <div className={s.pagina}>
      <header className={s.topo}>
        <Link to="/" className={s.voltar} aria-label="Voltar para a Home">
          <Icon nome="Arrow-Left" />
        </Link>
        <h1 className={s.titulo}>{titulo}</h1>
        <Link to={`/passo-a-passo/${slug}`} className={s.editar}>
          Editar
        </Link>
      </header>

      <main className={s.conteudo}>
        {temAlgo ? <Corpo slug={slug} manual={manual} /> : <p className={s.vazio}>Nada adicionado ainda.</p>}
      </main>
    </div>
  )
}

function Corpo({ slug, manual }) {
  switch (slug) {
    case 'logo':
    case 'icone':
      return <Arquivos porTipo={manual.uploads[slug]} />
    case 'paleta-de-cores':
      return <Paleta cores={manual.paleta} />
    case 'tipografia':
      return <Tipografia tipografia={manual.tipografia} />
    case 'fotografia':
      return <Fotografia selecoes={manual.fotografia.selecoes} />
    case 'personalidade':
      return <Personalidade posicoes={manual.personalidade} />
    case 'elementos':
      return <Elementos elementos={manual.elementos} />
    default:
      return null
  }
}

function Arquivos({ porTipo }) {
  const enviados = TIPOS_ARQUIVO.filter((tipo) => porTipo?.[tipo])

  return (
    <div className={s.grade}>
      {enviados.map((tipo) => (
        <figure key={tipo} className={s.arquivo}>
          <div className={tipo === 'branca' ? `${s.moldura} ${s.molduraEscura}` : s.moldura}>
            <img src={porTipo[tipo].url} alt="" className={s.imagem} />
          </div>
          <figcaption className={s.legenda}>
            {ROTULO_DO_ARQUIVO[tipo]}
            <span className={s.secundario}>{porTipo[tipo].nome}</span>
          </figcaption>
        </figure>
      ))}
    </div>
  )
}

function Paleta({ cores }) {
  return (
    <div className={s.lista}>
      {cores.map((cor) => (
        <section key={cor.id} className={s.bloco}>
          <div className={s.corTopo}>
            <span className={s.amostra} style={{ background: `#${cor.hex}` }} />
            <span className={s.nome}>{cor.nome}</span>
            <span className={s.secundario}>#{cor.hex}</span>
            {cor.principal && <span className={s.etiqueta}>Principal</span>}
          </div>

          <div className={s.tons}>
            {cor.tons.map((tom) => (
              <span key={tom.passo} className={s.tom}>
                <span className={s.amostraTom} style={{ background: `#${tom.hex}` }} />
                <span className={s.micro}>{tom.passo}</span>
              </span>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

function Tipografia({ tipografia }) {
  const secundarias = tipografia.secundarias.filter((vaga) => vaga.fonte)

  return (
    <div className={s.lista}>
      <Fonte fonte={tipografia.primaria} papel="Primária" />
      {secundarias.map((vaga) => (
        <Fonte key={vaga.id} fonte={vaga.fonte} papel="Secundária" />
      ))}
    </div>
  )
}

function Fonte({ fonte, papel }) {
  if (!fonte) return null
  const marcadas = fonte.variantes.filter((variante) => variante.marcado)

  return (
    <section className={s.bloco}>
      <div className={s.corTopo}>
        <span className={s.nome}>{fonte.familia}</span>
        <span className={s.etiqueta}>{papel}</span>
        <span className={s.secundario}>{fonte.categoria}</span>
      </div>
      <p className={s.pesos}>
        {marcadas.length > 0
          ? marcadas.map((variante) => variante.rotulo).join(' · ')
          : 'Nenhum peso ativo.'}
      </p>
    </section>
  )
}

function Fotografia({ selecoes }) {
  return (
    <div className={s.lista}>
      {categoriasEscolhidas(selecoes).map((categoria) => (
        <section key={categoria.id} className={s.bloco}>
          <h2 className={s.subtitulo}>{categoria.nome}</h2>
          <div className={s.fotos}>
            {selecoes[categoria.id].map((numero) => (
              <img
                key={numero}
                src={urlDaFoto(categoria.prefixo, numero)}
                alt={`${categoria.nome} ${numero}`}
                className={s.foto}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

function Personalidade({ posicoes }) {
  return (
    <div className={s.lista}>
      {EIXOS.map((eixo) => {
        const valor = posicoes[eixo.id] ?? 3
        return (
          <section key={eixo.id} className={s.eixo}>
            <span className={s.pontaEsquerda}>{eixo.esquerda.nome}</span>
            {/* Só leitura: o controle aparece desabilitado, e o número diz o
                mesmo para quem não enxerga a posição. */}
            <input
              type="range"
              className={s.controle}
              min={POSICOES[0]}
              max={POSICOES[POSICOES.length - 1]}
              step={1}
              value={valor}
              disabled
              readOnly
              aria-label={`De ${eixo.esquerda.nome} a ${eixo.direita.nome}`}
              aria-valuetext={`${valor} de 5`}
            />
            <span className={s.pontaDireita}>{eixo.direita.nome}</span>
            <span className={s.micro}>{valor} de 5</span>
          </section>
        )
      })}
    </div>
  )
}

function Elementos({ elementos }) {
  return (
    <div className={s.lista}>
      {elementos.map((elemento) => (
        <div key={elemento.id} className={s.elemento}>
          <Miniatura arquivo={elemento.arquivo} />
          <span className={s.nome}>{elemento.nome}</span>
          <span className={s.secundario}>{elemento.arquivo?.nome}</span>
        </div>
      ))}
    </div>
  )
}
