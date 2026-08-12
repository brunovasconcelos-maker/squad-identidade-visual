import { Link } from 'react-router-dom'
import Carregando from '../components/Carregando.jsx'
import Icon from '../components/Icon.jsx'
import useManual from '../hooks/useManual.js'
import { degradeDaMarca, fotoParaLogo } from '../lib/aplicacoesDaLogo.js'
import { urlDaImagem } from '../lib/imagens.js'
import s from './Logo.module.css'

/*
 * Página de leitura do Logo — o manual da marca, não o formulário.
 *
 * Tudo aqui é derivado do que já foi salvo (useManual): não há modelo de dados
 * novo. As duas escolhas automáticas — o degradê e a foto de fundo das
 * aplicações — moram em lib/aplicacoesDaLogo.js.
 */
export default function Logo() {
  const { manual, carregando } = useManual()

  if (carregando) return <Carregando mensagens={['Abrindo seu manual...']} />

  const arquivos = manual?.uploads?.logo
  const principal = arquivos?.principal
  const preta = arquivos?.preta
  const branca = arquivos?.branca

  return (
    <div className={s.pagina}>
      <header className={s.topo}>
        <Link to="/" className={s.voltar} aria-label="Voltar para a Home">
          <Icon nome="Arrow-Left" />
        </Link>
        <h1 className={s.titulo}>Logo</h1>
        {/* No Figma este canto tem o menu de três pontos, que é da Home. Aqui
            ele dá lugar ao atalho de edição, que a página precisa ter. */}
        <Link to="/passo-a-passo/logo" className={s.editar}>
          Editar
        </Link>
      </header>

      <main className={s.conteudo}>
        {principal ? (
          <div className={s.secoes}>
            <Primaria principal={principal} preta={preta} branca={branca} paleta={manual.paleta} />

            {/* Aqui entra a seção "Horizontal" (e as demais variações) quando o
                "Adicionar variações" do passo de Logo existir: mesma estrutura
                da Primária, uma seção por variação salva. Ver node 6064:4991. */}

            <AreaDeProtecao principal={principal} />
            <UsosIncorretos principal={principal} />
          </div>
        ) : (
          <p className={s.vazio}>
            Nada adicionado ainda. Envie a logo principal para ver o manual dela aqui.
          </p>
        )}
      </main>
    </div>
  )
}

/** Seção 1: a logo primária, as versões de cor única e as aplicações. */
function Primaria({ principal, preta, branca, paleta }) {
  // Com as duas versões, cada uma aparece uma vez: a preta sobre o degradê
  // claro e a branca sobre a foto. Com uma só, ela serve às duas aplicações.
  const noDegrade = preta ?? branca
  const naFoto = branca ?? preta
  const corNoDegrade = preta ? '000000' : 'FFFFFF'
  const corNaFoto = branca ? 'FFFFFF' : '000000'

  const degrade = degradeDaMarca(paleta, corNoDegrade)
  const foto = fotoParaLogo(corNaFoto)

  return (
    <section className={s.secao}>
      <h2 className={s.tituloDaSecao}>Logo Primária</h2>

      <div className={`${s.moldura} ${s.molduraGrande} ${s.fundoClaro}`}>
        <img className={`${s.logo} ${s.logoGrande}`} src={principal.url} alt="Logo principal" />
      </div>

      {(preta || branca) && (
        <div className={s.par}>
          {preta && (
            <div className={`${s.moldura} ${s.molduraComBorda}`}>
              <img className={s.logo} src={preta.url} alt="Logo em cor única preta" />
            </div>
          )}
          {branca && (
            <div className={`${s.moldura} ${s.fundoEscuro}`}>
              <img className={s.logo} src={branca.url} alt="Logo em cor única branca" />
            </div>
          )}
        </div>
      )}

      {/* Sem versão de cor única não há o que aplicar sobre fundo colorido: a
          logo principal costuma ter cor própria e brigaria com o fundo. */}
      {(preta || branca) && (
        <>
          <h3 className={s.tituloDaSubsecao}>Aplicação sobre gradiente e imagem</h3>
          <div className={s.par}>
            <div className={s.moldura} style={{ backgroundImage: degrade.css }}>
              <img className={s.logo} src={noDegrade.url} alt="Logo aplicada sobre gradiente" />
            </div>
            <div className={s.moldura}>
              {foto.nome && (
                <img className={s.fundoDaFoto} src={urlDaImagem(foto.nome)} alt="" />
              )}
              <img className={s.logo} src={naFoto.url} alt="Logo aplicada sobre foto" />
            </div>
          </div>
        </>
      )}
    </section>
  )
}

/**
 * Seção 3: área de proteção.
 *
 * A unidade de respiro é metade da altura da logo desenhada. Não há manual de
 * marca definido para tirar uma medida exata daqui, então vale a proporção do
 * Figma (node 6064:5032), onde o quadrado-guia tem pouco mais da metade da
 * altura da logo. Quem lê precisa entender "deixe este tanto de espaço", e é
 * isso que as linhas e os quadrados de canto mostram.
 */
function AreaDeProtecao({ principal }) {
  return (
    <section className={s.secao}>
      <h2 className={s.tituloDaSecao}>Área de Proteção</h2>

      <div className={`${s.moldura} ${s.molduraGrande} ${s.fundoClaro}`}>
        <div className={s.protecao}>
          {/* As linhas atravessam a moldura; os quadrados marcam a unidade. */}
          <span className={`${s.rasgo} ${s.rasgoTopo}`} aria-hidden="true" />
          <span className={`${s.rasgo} ${s.rasgoBase}`} aria-hidden="true" />
          <span className={`${s.rasgo} ${s.rasgoEsquerda}`} aria-hidden="true" />
          <span className={`${s.rasgo} ${s.rasgoDireita}`} aria-hidden="true" />

          <span className={s.limite} aria-hidden="true" />
          <span className={`${s.unidade} ${s.unidadeTopo}`} aria-hidden="true" />
          <span className={`${s.unidade} ${s.unidadeBase}`} aria-hidden="true" />
          <span className={`${s.unidade} ${s.unidadeEsquerda}`} aria-hidden="true" />
          <span className={`${s.unidade} ${s.unidadeDireita}`} aria-hidden="true" />

          <img
            className={`${s.logo} ${s.logoProtegido}`}
            src={principal.url}
            alt="Logo com a área de proteção ao redor"
          />
        </div>
      </div>
    </section>
  )
}

/** Seção 4: os quatro erros de uso, cada um com a legenda embaixo. */
function UsosIncorretos({ principal }) {
  return (
    <section className={s.secao}>
      <h2 className={s.tituloDaSecao}>Usos Incorretos</h2>

      <div className={s.erros}>
        <Erro legenda="Não use a logo na diagonal">
          <img className={`${s.logo} ${s.inclinada}`} src={principal.url} alt="" />
        </Erro>

        <Erro legenda="Não estique ou deforme a logo">
          <img className={`${s.logo} ${s.espremida}`} src={principal.url} alt="" />
        </Erro>

        <Erro legenda="Não use a logo sem contraste" className={s.semContraste}>
          <img className={s.logo} src={principal.url} alt="" />
        </Erro>

        <Erro legenda="Não use a logo quebrada ou dividida">
          {/* Duas cópias, cada uma mostrando metade: a da esquerda em cima, a da
              direita embaixo, com um vão entre elas. */}
          <span className={s.partida}>
            <img className={`${s.logo} ${s.metadeEsquerda}`} src={principal.url} alt="" />
            <img className={`${s.logo} ${s.metadeDireita}`} src={principal.url} alt="" />
          </span>
        </Erro>
      </div>
    </section>
  )
}

function Erro({ legenda, className, children }) {
  return (
    <figure className={s.erro}>
      <div className={[s.moldura, s.molduraComBorda, className].filter(Boolean).join(' ')}>
        {children}
      </div>
      <figcaption className={s.legenda}>{legenda}</figcaption>
    </figure>
  )
}
