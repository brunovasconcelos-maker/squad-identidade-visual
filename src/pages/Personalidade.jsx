import PaginaDoTema from '../components/PaginaDoTema.jsx'
import useManual from '../hooks/useManual.js'
import { eixosDefinidos, POSICOES } from '../data/personalidade.js'
import { esquerdaDaPosicao, estiloDoPreenchimento, noCaminho } from '../lib/personalidade.js'
import { urlDaImagem } from '../lib/imagens.js'
import s from './Personalidade.module.css'

/*
 * Página de leitura da Personalidade — node 6206:5487 do Figma.
 *
 * Só os eixos que receberam uma posição. Um eixo sem escolha some inteiro —
 * sem linha, sem as imagens dos extremos, sem lugar vazio guardado: desenhá-lo
 * no meio seria mentira, porque o meio é uma escolha possível, e desenhá-lo
 * apagado ocuparia a página com o que não foi respondido.
 *
 * A faixa aqui é desenho, não controle: nada de arrastar nem de clicar. Por
 * isso não há <input type="range"> — só as bolinhas e o preenchimento, com a
 * mesma geometria do passo (src/lib/personalidade.js), para as duas telas
 * mostrarem a posição no mesmo lugar.
 */
export default function Personalidade() {
  const { manual, carregando } = useManual()
  const posicoes = manual?.personalidade ?? {}
  const eixos = eixosDefinidos(posicoes)

  return (
    <PaginaDoTema
      titulo="Personalidade"
      slug="personalidade"
      carregando={carregando}
      temConteudo={eixos.length > 0}
      vazio="Nada adicionado ainda. Defina a personalidade da marca para vê-la aqui."
    >
      <div className={s.eixos}>
        {eixos.map((eixo) => (
          <Eixo key={eixo.id} eixo={eixo} valor={posicoes[eixo.id]} />
        ))}
      </div>
    </PaginaDoTema>
  )
}

function Eixo({ eixo, valor }) {
  return (
    <section className={s.eixo}>
      <Extremo {...eixo.esquerda} />

      {/* A posição só existe como desenho, então quem não enxerga precisa de
          um rótulo que a diga. */}
      <div
        className={s.trilho}
        role="img"
        aria-label={`De ${eixo.esquerda.nome} a ${eixo.direita.nome}: ${valor} de 5`}
      >
        <div className={s.pontos}>
          {POSICOES.map((posicao, i) => (
            <span
              key={posicao}
              className={noCaminho(posicao, valor) ? `${s.ponto} ${s.pontoNoCaminho}` : s.ponto}
              style={{ left: esquerdaDaPosicao(i) }}
            />
          ))}

          {/* Depois das bolinhas: a faixa cobre o vão entre elas, e as duas
              pontas do caminho continuam sendo bolinhas inteiras. */}
          <span className={s.preenchimento} style={estiloDoPreenchimento(valor)} />
        </div>
      </div>

      <Extremo {...eixo.direita} />
    </section>
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
