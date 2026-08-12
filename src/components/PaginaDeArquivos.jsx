import PaginaDoTema from './PaginaDoTema.jsx'
import useFundoSemContraste from '../hooks/useFundoSemContraste.js'
import useManual from '../hooks/useManual.js'
import { degradeDaMarca, fotoParaLogo } from '../lib/aplicacoesDaLogo.js'
import { urlDaImagem } from '../lib/imagens.js'
import s from './PaginaDeArquivos.module.css'

/*
 * Toda a escrita das duas páginas, junta, porque o português não deixa
 * parametrizar isto com um substantivo só: "a logo" é feminino e "o ícone" é
 * masculino, e a concordância pega em artigo, pronome e adjetivo
 * ("quebrada ou dividida" contra "quebrado ou dividido").
 */
const TEXTOS = {
  logo: {
    secao: 'Logo Primária',
    vazio: 'Nada adicionado ainda. Envie a logo principal para ver o manual dela aqui.',
    alt: {
      principal: 'Logo principal',
      preta: 'Logo em cor única preta',
      branca: 'Logo em cor única branca',
      degrade: 'Logo aplicada sobre gradiente',
      foto: 'Logo aplicada sobre foto',
      protecao: 'Logo com a área de proteção ao redor',
    },
    erros: [
      'Não use a logo na diagonal',
      'Não estique ou deforme a logo',
      'Não use a logo sem contraste',
      'Não use a logo quebrada ou dividida',
    ],
  },
  icone: {
    secao: 'Ícone Principal',
    vazio: 'Nada adicionado ainda. Envie o ícone principal para ver o manual dele aqui.',
    alt: {
      principal: 'Ícone principal',
      preta: 'Ícone em cor única preta',
      branca: 'Ícone em cor única branca',
      degrade: 'Ícone aplicado sobre gradiente',
      foto: 'Ícone aplicado sobre foto',
      protecao: 'Ícone com a área de proteção ao redor',
    },
    erros: [
      'Não use o ícone na diagonal',
      'Não estique ou deforme o ícone',
      'Não use o ícone sem contraste',
      'Não use o ícone quebrado ou dividido',
    ],
  },
}

/*
 * Página de leitura dos temas feitos de arquivo enviado — Logo e Ícone. É o
 * manual da marca, não o formulário.
 *
 * Os dois temas têm a mesma forma (principal, cor única preta, cor única
 * branca) e a mesma apresentação, então dividem esta página, do mesmo jeito
 * que os passos dividem o PassoArquivos. Muda o `slug` de onde os arquivos
 * saem, o título e a escrita.
 *
 * Tudo é derivado do que já foi salvo (useManual): não há modelo de dados
 * novo. As duas escolhas automáticas — o degradê e a foto de fundo das
 * aplicações — moram em lib/aplicacoesDaLogo.js.
 */
export default function PaginaDeArquivos({ titulo, slug }) {
  const { manual, carregando } = useManual()
  const textos = TEXTOS[slug]

  const arquivos = manual?.uploads?.[slug]
  const principal = arquivos?.principal
  const preta = arquivos?.preta
  const branca = arquivos?.branca

  return (
    <PaginaDoTema
      titulo={titulo}
      slug={slug}
      carregando={carregando}
      temConteudo={Boolean(principal)}
      vazio={textos.vazio}
    >
      <Primaria
        principal={principal}
        preta={preta}
        branca={branca}
        paleta={manual?.paleta}
        textos={textos}
      />

      {/* Aqui entram as seções das variações ("Horizontal" e as demais)
          quando o "Adicionar variações" do passo existir: mesma estrutura
          da Primária, uma seção por variação salva. Ver node 6064:4991. */}

      <AreaDeProtecao principal={principal} textos={textos} />
      <UsosIncorretos principal={principal} textos={textos} />
    </PaginaDoTema>
  )
}

/** Seção 1: o arquivo principal, as versões de cor única e as aplicações. */
function Primaria({ principal, preta, branca, paleta, textos }) {
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
      <h2 className={s.tituloDaSecao}>{textos.secao}</h2>

      <div className={`${s.moldura} ${s.molduraGrande} ${s.fundoClaro}`}>
        <img
          className={`${s.marca} ${s.marcaGrande}`}
          src={principal.url}
          alt={textos.alt.principal}
        />
      </div>

      {(preta || branca) && (
        <div className={s.par}>
          {preta && (
            <div className={`${s.moldura} ${s.molduraComBorda}`}>
              <img className={s.marca} src={preta.url} alt={textos.alt.preta} />
            </div>
          )}
          {branca && (
            <div className={`${s.moldura} ${s.fundoEscuro}`}>
              <img className={s.marca} src={branca.url} alt={textos.alt.branca} />
            </div>
          )}
        </div>
      )}

      {/* Sem versão de cor única não há o que aplicar sobre fundo colorido: a
          logo principal costuma ter cor própria e brigaria com o fundo. */}
      {(preta || branca) && (
        <div className={s.par}>
          <div className={s.moldura} style={{ backgroundImage: degrade.css }}>
            <img className={s.marca} src={noDegrade.url} alt={textos.alt.degrade} />
          </div>
          <div className={s.moldura}>
            {foto.nome && <img className={s.fundoDaFoto} src={urlDaImagem(foto.nome)} alt="" />}
            <img className={s.marca} src={naFoto.url} alt={textos.alt.foto} />
          </div>
        </div>
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
function AreaDeProtecao({ principal, textos }) {
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
            className={`${s.marca} ${s.marcaProtegida}`}
            src={principal.url}
            alt={textos.alt.protecao}
          />
        </div>
      </div>
    </section>
  )
}

/** Seção 4: os quatro erros de uso, cada um com a legenda embaixo. */
function UsosIncorretos({ principal, textos }) {
  // O fundo do exemplo sem contraste sai da própria marca: um cinza fixo não
  // serve, porque contra uma marca clara ele até que contrasta bem, e aí o
  // exemplo do erro não mostra erro nenhum.
  const fundoSemContraste = useFundoSemContraste(principal.url)

  return (
    <section className={s.secao}>
      <h2 className={s.tituloDaSecao}>Usos Incorretos</h2>

      <div className={s.erros}>
        <Erro legenda={textos.erros[0]}>
          <img className={`${s.marca} ${s.inclinada}`} src={principal.url} alt="" />
        </Erro>

        <Erro legenda={textos.erros[1]}>
          <img className={`${s.marca} ${s.espremida}`} src={principal.url} alt="" />
        </Erro>

        <Erro
          legenda={textos.erros[2]}
          className={s.semContraste}
          estilo={fundoSemContraste ? { backgroundColor: fundoSemContraste } : undefined}
        >
          <img className={s.marca} src={principal.url} alt="" />
        </Erro>

        <Erro legenda={textos.erros[3]}>
          {/* Duas cópias, cada uma mostrando metade: a da esquerda em cima, a da
              direita embaixo, com um vão entre elas. */}
          <span className={s.partida}>
            <img className={`${s.marca} ${s.metadeEsquerda}`} src={principal.url} alt="" />
            <img className={`${s.marca} ${s.metadeDireita}`} src={principal.url} alt="" />
          </span>
        </Erro>
      </div>
    </section>
  )
}

function Erro({ legenda, className, estilo, children }) {
  return (
    <figure className={s.erro}>
      <div
        className={[s.moldura, s.molduraComBorda, className].filter(Boolean).join(' ')}
        style={estilo}
      >
        {children}
      </div>
      <figcaption className={s.legenda}>{legenda}</figcaption>
    </figure>
  )
}
