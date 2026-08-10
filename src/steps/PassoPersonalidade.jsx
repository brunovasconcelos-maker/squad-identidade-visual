import Icon from '../components/Icon.jsx'
import { EIXOS, POSICOES } from '../data/personalidade.js'
import { urlDaImagem } from '../lib/imagens.js'
import s from './PassoPersonalidade.module.css'

/**
 * Passo de Personalidade: cinco eixos de opostos, cada um com um controle de
 * cinco posições. Nunca fica vazio — todo eixo já nasce no meio —, então o
 * "Continuar" está sempre habilitado e o "Não tenho, pular" não aparece. Isso
 * sai de graça da regra do fluxo: `conteudoDoPilar.personalidade` é sempre
 * verdadeiro, e o `mostrarPular = !temConteudo` cuida do resto.
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
 * A bolinha faz parte do caminho preenchido?
 *
 * Precisa estar do mesmo lado do centro que o cursor (daí o produto dos sinais
 * não ser negativo) e não passar dele (daí a comparação das distâncias). No 3
 * só o próprio centro entra.
 */
function noCaminho(posicao, valor) {
  return (posicao - 3) * (valor - 3) >= 0 && Math.abs(posicao - 3) <= Math.abs(valor - 3)
}

// 3 é o centro; a distância até ele, em quartos da faixa útil, é a largura.
function estiloDoPreenchimento(valor) {
  const largura = `calc(${Math.abs(valor - 3) / 4} * (100% - 18px))`
  return valor >= 3 ? { left: '50%', width: largura } : { right: '50%', width: largura }
}

function Eixo({ eixo, valor, onMudar }) {
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
              style={{ left: `calc((100% - 18px) * ${i} / 4)` }}
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
            className={s.controle}
            min={POSICOES[0]}
            max={POSICOES[POSICOES.length - 1]}
            step={1}
            value={valor}
            onChange={(evento) => onMudar(Number(evento.target.value))}
            aria-label={`De ${eixo.esquerda.nome} a ${eixo.direita.nome}`}
            aria-valuetext={`${valor} de 5, entre ${eixo.esquerda.nome} e ${eixo.direita.nome}`}
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
