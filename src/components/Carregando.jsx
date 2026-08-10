import { useEffect, useState } from 'react'
import Icon from './Icon.jsx'
import tom from '../assets/imagens/Tom-Home.png'
import s from './Carregando.module.css'

export const MENSAGENS_DA_FINALIZACAO = [
  'Organizando os arquivos de logo e as variações que você enviou',
  'Calculando os tons claros e escuros da paleta.',
  'Reunindo tipografia, fotografia e personalidade da marca.',
  'Montando as regras de uso, tamanho e aplicação do logo.',
  'Gerando os mockups com a identidade aplicada.',
]

export const DURACAO_DA_MENSAGEM = 2000

/** Tempo mínimo da tela: todas as mensagens precisam aparecer. */
export const DURACAO_TOTAL = MENSAGENS_DA_FINALIZACAO.length * DURACAO_DA_MENSAGEM

/**
 * Tela de espera da finalização.
 *
 * As mensagens passam sozinhas, uma a cada dois segundos. Quem decide quando
 * sair é o PassoAPasso: só navega quando a gravação terminou **e** as cinco
 * mensagens já passaram.
 *
 * O X do topo é só visual, como no desenho — a tela é passageira e não há o
 * que cancelar no meio.
 */
export default function Carregando({ mensagens = MENSAGENS_DA_FINALIZACAO, titulo }) {
  const [indice, setIndice] = useState(0)

  useEffect(() => {
    if (mensagens.length <= 1) return undefined

    const relogio = setInterval(() => {
      // Para na última: a saída é decidida de fora.
      setIndice((atual) => Math.min(atual + 1, mensagens.length - 1))
    }, DURACAO_DA_MENSAGEM)

    return () => clearInterval(relogio)
  }, [mensagens])

  return (
    <div className={s.pagina} role="status" aria-live="polite">
      <header className={s.topo}>
        <p className={s.tituloDoTopo}>Identidade Visual</p>
        {/* Sem ação de propósito: a tela dura poucos segundos. */}
        <span className={s.fechar} aria-hidden="true">
          <Icon nome="Close" />
        </span>
      </header>

      <div className={s.centro}>
        <h1 className={s.titulo}>
          {titulo ?? (
            <>
              Estamos trabalhando em criar
              <br />
              seu Manual de Identidade Visual...
            </>
          )}
        </h1>

        <img src={tom} alt="" className={s.ilustracao} />

        {/* A key troca junto com o texto, e é o que reinicia o fade. */}
        <p key={indice} className={s.mensagem}>
          {mensagens[indice]}
        </p>
      </div>
    </div>
  )
}
