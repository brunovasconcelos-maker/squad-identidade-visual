import { useEffect, useRef, useState } from 'react'
import Icon from '../components/Icon.jsx'
import PaginaDoTema from '../components/PaginaDoTema.jsx'
import useManual from '../hooks/useManual.js'
import { nomeDoAgente } from '../data/agentes.js'
import { urlDoAvatar } from '../lib/avatares.js'
import s from './TomDeVoz.module.css'

/*
 * Página de leitura do Tom de Voz — node 6195:4674 do Figma.
 *
 * Um cartão por tom salvo: o selo com o ícone, o nome, os avatares dos agentes
 * atribuídos, as instruções gerais e as palavras a evitar com as substitutas
 * ao lado.
 *
 * Só leitura, e o "Editar" do topo leva ao passo — é lá que cada cartão tem o
 * próprio lápis e a própria lixeira. Não há edição por tom aqui.
 */
export default function TomDeVoz() {
  const { manual, carregando } = useManual()
  const tons = manual?.tomDeVoz ?? []

  return (
    <PaginaDoTema
      titulo="Tom de Voz"
      slug="tom-de-voz"
      carregando={carregando}
      temConteudo={tons.length > 0}
      vazio="Nada adicionado ainda. Crie um tom de voz para vê-lo aqui."
    >
      {tons.map((tom) => (
        <Cartao key={tom.id} tom={tom} />
      ))}
    </PaginaDoTema>
  )
}

function Cartao({ tom }) {
  return (
    <section className={s.cartao}>
      <div className={s.cabecalho}>
        <div className={s.grupo}>
          <span className={s.selo}>
            <Icon nome="Personalidade" tamanho={32} />
          </span>
          <h2 className={s.nome}>{tom.nome}</h2>
        </div>

        {tom.agentes.length > 0 && (
          <div className={s.avatares}>
            {tom.agentes.map((id) => (
              <img
                key={id}
                className={s.avatar}
                src={urlDoAvatar(id)}
                alt={nomeDoAgente(id)}
                title={nomeDoAgente(id)}
              />
            ))}
          </div>
        )}
      </div>

      {tom.instrucoes.trim() && (
        <div className={s.bloco}>
          <p className={s.rotulo}>Instruções Gerais</p>
          <Instrucoes texto={tom.instrucoes} />
        </div>
      )}

      {tom.evitar.length > 0 && (
        <div className={s.bloco}>
          <div className={s.palavras}>
            <p className={s.cabecalhoDaColuna}>Evite usar</p>
            <p className={s.cabecalhoDaColuna}>Substituir por</p>

            {tom.evitar.map((item) => (
              // A substituta vai na mesma linha da palavra. Sem substituta a
              // célula da direita fica vazia, e a linha não some.
              <Fragmento key={item.id}>
                <p className={s.palavra}>{item.palavra}</p>
                {item.substituto.trim() ? (
                  <p className={s.palavra}>{item.substituto}</p>
                ) : (
                  <span aria-hidden="true" />
                )}
              </Fragmento>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

/** Duas células do grid vindas do mesmo item, sem embrulho que quebre a grade. */
function Fragmento({ children }) {
  return children
}

/**
 * As instruções, recolhidas em três linhas.
 *
 * O "Ver mais" só aparece quando o texto realmente não cabe — medindo a altura
 * do conteúdo contra a da caixa, e não pelo comprimento do texto, que dependeria
 * da largura da tela e do tamanho da fonte para acertar.
 */
function Instrucoes({ texto }) {
  const [aberto, setAberto] = useState(false)
  const [transborda, setTransborda] = useState(false)
  const paragrafo = useRef(null)

  useEffect(() => {
    const medir = () => {
      const el = paragrafo.current
      if (!el || aberto) return
      setTransborda(el.scrollHeight > el.clientHeight + 1)
    }

    medir()
    // Mudar a largura muda quantas linhas o texto ocupa.
    window.addEventListener('resize', medir)
    return () => window.removeEventListener('resize', medir)
  }, [texto, aberto])

  return (
    <>
      <p
        ref={paragrafo}
        className={aberto ? s.instrucoes : `${s.instrucoes} ${s.recolhido}`}
      >
        {texto}
      </p>

      {(transborda || aberto) && (
        <button type="button" className={s.verMais} onClick={() => setAberto((estava) => !estava)}>
          {aberto ? 'Ver menos' : 'Ver mais'}
        </button>
      )}
    </>
  )
}
