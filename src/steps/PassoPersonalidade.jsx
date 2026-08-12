import Icon from '../components/Icon.jsx'
import { CENTRO, EIXOS, POSICOES } from '../data/personalidade.js'
import { esquerdaDaPosicao, estiloDoPreenchimento, noCaminho } from '../lib/personalidade.js'
import { urlDaImagem } from '../lib/imagens.js'
import s from './PassoPersonalidade.module.css'

/**
 * Passo de Personalidade: cinco eixos de opostos, cada um com um controle de
 * cinco posições.
 *
 * Nenhum eixo nasce com valor — todas as bolinhas cinza, sem faixa e sem
 * cursor. Um eixo no meio passa a significar "escolhi o meio", e não "não
 * mexi". Basta um eixo definido para o passo contar como preenchido; os outros
 * podem ficar sem valor.
 */
export default function PassoPersonalidade({ personalidade, acoes }) {
  return (
    <div className={s.passo}>
      <div className={s.cabecalho}>
        <div className={s.tituloGrupo}>
          <h2 className={s.titulo}>Personalidade da Marca</h2>
          {/* Ainda sem modal de ajuda: por enquanto só o hover. */}
          <button type="button" className={s.ajuda} aria-label="Sobre a personalidade da marca">
            <Icon nome="Help" />
          </button>
        </div>
      </div>

      <div className={s.eixos}>
        {EIXOS.map((eixo) => (
          <Eixo
            key={eixo.id}
            eixo={eixo}
            valor={personalidade[eixo.id]}
            onMudar={(valor) => acoes.definirPosicao(eixo.id, valor)}
          />
        ))}
      </div>
    </div>
  )
}

/**
 * A posição sob um clique, contada na faixa em que o cursor anda.
 *
 * Serve ao eixo ainda sem valor: ali o input está parado no centro só para ter
 * um valor válido, então clicar exatamente no ponto do meio não mudaria nada e
 * o `change` não dispararia. Com o valor lido do próprio clique, todos os cinco
 * pontos respondem igual.
 */
function posicaoDoClique(evento) {
  const caixa = evento.currentTarget.getBoundingClientRect()
  const util = caixa.width - 18
  if (util <= 0) return CENTRO

  const fracao = (evento.clientX - caixa.left - 9) / util
  const indice = Math.min(POSICOES.length - 1, Math.max(0, Math.round(fracao * 4)))
  return POSICOES[indice]
}

function Eixo({ eixo, valor, onMudar }) {
  const semValor = valor == null

  return (
    <div className={s.eixo}>
      <Extremo {...eixo.esquerda} />

      <div className={s.trilho}>
        {/* Área interna de 526px (532 menos 3px de cada lado), que é onde as
            bolinhas e o cursor se movem — é o que faz o cursor parar em cima
            de cada bolinha. */}
        <div className={s.pontos}>
          {POSICOES.map((posicao, i) => (
            <span
              key={posicao}
              className={noCaminho(posicao, valor) ? `${s.ponto} ${s.pontoNoCaminho}` : s.ponto}
              // Mesmo cálculo que o navegador usa para o cursor do range, então
              // os dois coincidem em qualquer largura.
              style={{ left: esquerdaDaPosicao(i) }}
            />
          ))}

          {/* Depois das bolinhas e antes do input: assim a faixa cobre as
              bolinhas que ficaram para trás e o cursor continua por cima.
              Nasce no centro e cresce para o lado escolhido, em vez de vir de
              uma das pontas — no 3 tem largura zero e sobra só o cursor. */}
          <span className={s.preenchimento} style={estiloDoPreenchimento(valor)} />

          {/* O range nativo já dá o arrasto com encaixe, o clique direto na
              bolinha e as setas do teclado. O cursor dele é a bolinha preta,
              que cobre a cinza da posição atual. */}
          <input
            type="range"
            className={semValor ? `${s.controle} ${s.semValor}` : s.controle}
            min={POSICOES[0]}
            max={POSICOES[POSICOES.length - 1]}
            step={1}
            // Sem valor o input fica no centro só para ser válido; quem o
            // esconde é a classe, e o clique é lido pela posição.
            value={valor ?? CENTRO}
            onChange={(evento) => onMudar(Number(evento.target.value))}
            onPointerDown={semValor ? (evento) => onMudar(posicaoDoClique(evento)) : undefined}
            aria-label={`De ${eixo.esquerda.nome} a ${eixo.direita.nome}`}
            aria-valuetext={
              semValor
                ? `Sem escolha, entre ${eixo.esquerda.nome} e ${eixo.direita.nome}`
                : `${valor} de 5, entre ${eixo.esquerda.nome} e ${eixo.direita.nome}`
            }
          />
        </div>
      </div>

      <Extremo {...eixo.direita} />
    </div>
  )
}

function Extremo({ nome, imagem }) {
  return (
    <div className={s.extremo}>
      <img className={s.imagem} src={urlDaImagem(imagem)} alt="" />
      <span className={s.rotulo}>{nome}</span>
    </div>
  )
}
