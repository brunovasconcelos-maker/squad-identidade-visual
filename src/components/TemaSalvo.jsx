import PaginaDoTema from './PaginaDoTema.jsx'
import { Miniatura } from './ModalElemento.jsx'
import useManual from '../hooks/useManual.js'
import { temaCompleto } from '../lib/manual.js'
import { categoriasEscolhidas } from '../data/fotografia.js'
import { eixosDefinidos, POSICOES } from '../data/personalidade.js'
import { urlDaFoto } from '../lib/imagens.js'
import s from './TemaSalvo.module.css'

/**
 * Visão de leitura do que foi salvo num tema que ainda não tem página própria
 * — Fotografia, Personalidade e Elementos.
 *
 * É de propósito simples: mostra o conteúdo gravado sem edição nenhuma. O
 * desenho de verdade vem depois, um tema por vez; por ora o que importa é
 * conseguir conferir o que está no manual. A casca (topo, coluna e vazio) é a
 * mesma das páginas já desenhadas.
 */
export default function TemaSalvo({ titulo, slug, vazio = 'Nada adicionado ainda.' }) {
  const { manual, carregando } = useManual()

  return (
    <PaginaDoTema
      titulo={titulo}
      slug={slug}
      carregando={carregando}
      temConteudo={temaCompleto(manual, slug)}
      vazio={vazio}
    >
      <Corpo slug={slug} manual={manual} />
    </PaginaDoTema>
  )
}

function Corpo({ slug, manual }) {
  switch (slug) {
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

/* Só os eixos escolhidos: um eixo sem valor desenhado no meio seria mentira,
   porque no meio é uma escolha possível. */
function Personalidade({ posicoes }) {
  return (
    <div className={s.lista}>
      {eixosDefinidos(posicoes).map((eixo) => {
        const valor = posicoes[eixo.id]
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
