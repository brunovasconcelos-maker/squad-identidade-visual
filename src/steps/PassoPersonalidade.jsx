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
              className={s.ponto}
              // Mesmo cálculo que o navegador usa para o cursor do range, então
              // os dois coincidem em qualquer largura.
              style={{ left: `calc((100% - 18px) * ${i} / 4)` }}
            />
          ))}

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
