import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import FlowTopBar from '../components/FlowTopBar.jsx'
import FlowBottomBar from '../components/FlowBottomBar.jsx'
import PassoLogo from '../steps/PassoLogo.jsx'
import PassoIcone from '../steps/PassoIcone.jsx'
import PassoPaleta from '../steps/PassoPaleta.jsx'
import PassoTipografia from '../steps/PassoTipografia.jsx'
import PassoFotografia from '../steps/PassoFotografia.jsx'
import PassoPersonalidade from '../steps/PassoPersonalidade.jsx'
import useFluxo from '../hooks/useFluxo.js'
import { pilares, temas } from '../data/pilares.js'
import { totalDeFotos } from '../data/fotografia.js'
import s from './PassoAPasso.module.css'

// No Figma esses dois passos têm 808px de conteúdo, mais que as 6 colunas
// centrais (670px) usadas pelos demais. Ver .centroLargo no CSS.
const PASSOS_LARGOS = ['fotografia', 'personalidade']

export default function PassoAPasso() {
  const { tema } = useParams()

  // Sem :tema -> fluxo completo. Com :tema -> fluxo de um tema só.
  return tema ? <FluxoDeUmTema tema={tema} /> : <FluxoCompleto />
}

function FluxoCompleto() {
  const navigate = useNavigate()
  const total = pilares.length
  const [passo, setPasso] = useState(1)
  // Um estado só para o fluxo inteiro: ir e voltar entre passos não perde nada.
  const {
    uploads,
    salvarUpload,
    paleta,
    acoesDaPaleta,
    tipografia,
    acoesDaTipografia,
    fotografia,
    acoesDaFotografia,
    personalidade,
    acoesDaPersonalidade,
  } = useFluxo()

  const pilarAtual = pilares[passo - 1]

  // A Fotografia tem duas telas dentro do mesmo passo: a barra de progresso
  // não anda ao passar da seleção para o resumo, só no "Continuar" do resumo.
  const ehFotografia = pilarAtual.slug === 'fotografia'
  const fotosEscolhidas = totalDeFotos(fotografia.selecoes)
  const noResumoDaFotografia = ehFotografia && fotografia.tela === 'resumo'

  // Nos passos de arquivo basta o principal; na paleta, ao menos uma cor; na
  // tipografia, a fonte primária — as secundárias são opcionais. As variações
  // preta e branca seguem opcionais, e passos ainda sem conteúdo não têm
  // entrada em uploads, então continuam desabilitados.
  const conteudoDoPilar = {
    'paleta-de-cores': () => paleta.length > 0,
    tipografia: () => Boolean(tipografia.primaria),
    fotografia: () => fotosEscolhidas > 0,
    // Os eixos já nascem no meio, então este passo nunca está vazio.
    personalidade: () => true,
  }

  const temConteudo =
    conteudoDoPilar[pilarAtual.slug]?.() ?? Boolean(uploads[pilarAtual.slug]?.principal)

  // Regra do fluxo inteiro: "Não tenho, pular" e "Continuar" nunca aparecem
  // habilitados ao mesmo tempo. Assim que o passo tem conteúdo, o pular some
  // de vez — não fica desabilitado. Vale para todos os passos, inclusive os
  // que ainda serão construídos, então é uma expressão só e não caso a caso.
  const mostrarPular = !temConteudo

  const conteudoDoPasso = () => {
    const props = {
      arquivos: uploads[pilarAtual.slug],
      onSalvar: (tipo, arquivo) => salvarUpload(pilarAtual.slug, tipo, arquivo),
    }

    switch (pilarAtual.slug) {
      case 'logo':
        return <PassoLogo {...props} />
      case 'icone':
        return <PassoIcone {...props} />
      case 'paleta-de-cores':
        return <PassoPaleta paleta={paleta} acoes={acoesDaPaleta} />
      case 'tipografia':
        return <PassoTipografia tipografia={tipografia} acoes={acoesDaTipografia} />
      case 'fotografia':
        return <PassoFotografia fotografia={fotografia} acoes={acoesDaFotografia} />
      case 'personalidade':
        return (
          <PassoPersonalidade personalidade={personalidade} acoes={acoesDaPersonalidade} />
        )
      default:
        return null
    }
  }

  // Sair do fluxo desmonta este componente, e com ele o estado dos uploads.
  // É o que faz o X e o "Voltar" do passo 1 descartarem o que foi enviado.
  const sairDoFluxo = () => navigate('/')

  const concluir = () => {
    // TODO: salvar o fluxo de verdade quando a etapa final existir. Até lá
    // concluir apenas sai, e os uploads em memória são descartados.
    sairDoFluxo()
  }

  const voltar = () => {
    // Do resumo da Fotografia se volta para a seleção, não para o passo
    // anterior — as escolhas ficam onde estão.
    if (noResumoDaFotografia) acoesDaFotografia.irParaTela('selecao')
    else if (passo === 1) sairDoFluxo()
    else setPasso((atual) => atual - 1)
  }

  const proximoPasso = () => {
    if (passo === total) concluir()
    else setPasso((atual) => atual + 1)
  }

  const avancar = () => {
    // Na seleção da Fotografia, "Continuar" abre o resumo: é transição interna
    // do passo, então o progresso não muda.
    if (ehFotografia && !noResumoDaFotografia) acoesDaFotografia.irParaTela('resumo')
    else proximoPasso()
  }

  // "Não tenho, pular" na Fotografia salta o passo inteiro, sem passar pelo
  // resumo — que estaria vazio de qualquer forma.
  const pular = () => proximoPasso()

  return (
    <div className={s.pagina}>
      {/* O topo mostra o tema do passo atual, não o nome do pilar. */}
      <FlowTopBar titulo={pilarAtual.titulo} onFechar={sairDoFluxo} />

      {/* Só esta área rola. Os passos restantes entram no switch acima. */}
      <main className={s.conteudo}>
        <div className={s.grade}>
          {/* A Fotografia usa um bloco mais largo: a grade 3x3 tem 808px no
              Figma, e não cabe nas 6 colunas centrais dos outros passos. */}
          <div className={PASSOS_LARGOS.includes(pilarAtual.slug) ? s.centroLargo : s.centro}>
            {conteudoDoPasso()}
          </div>
        </div>
      </main>

      <FlowBottomBar
        passo={passo}
        total={total}
        temConteudo={temConteudo}
        mostrarPular={mostrarPular}
        onVoltar={voltar}
        onPular={pular}
        onContinuar={avancar}
      />
    </div>
  )
}

// Ainda é o placeholder do setup: o fluxo de um tema só será especificado depois.
function FluxoDeUmTema({ tema }) {
  if (!temas.includes(tema)) {
    return (
      <section className="page">
        <h1>Passo a Passo</h1>
        <p className="page-placeholder">Tema desconhecido: “{tema}”.</p>
      </section>
    )
  }

  return (
    <section className="page">
      <h1>Passo a Passo — {tema}</h1>
      <p className="page-placeholder">Fluxo do tema — conteúdo definido depois.</p>
    </section>
  )
}
