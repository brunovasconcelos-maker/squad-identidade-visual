import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import FlowTopBar from '../components/FlowTopBar.jsx'
import FlowBottomBar from '../components/FlowBottomBar.jsx'
import PassoLogo from '../steps/PassoLogo.jsx'
import PassoIcone from '../steps/PassoIcone.jsx'
import PassoPaleta from '../steps/PassoPaleta.jsx'
import PassoTipografia from '../steps/PassoTipografia.jsx'
import useFluxo from '../hooks/useFluxo.js'
import { pilares, temas } from '../data/pilares.js'
import s from './PassoAPasso.module.css'

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
  const { uploads, salvarUpload, paleta, acoesDaPaleta, tipografia, acoesDaTipografia } = useFluxo()

  const pilarAtual = pilares[passo - 1]
  const ehPaleta = pilarAtual.slug === 'paleta-de-cores'

  // Nos passos de arquivo basta o principal; na paleta, ao menos uma cor; na
  // tipografia, a fonte primária — as secundárias são opcionais. As variações
  // preta e branca seguem opcionais, e passos ainda sem conteúdo não têm
  // entrada em uploads, então continuam desabilitados.
  const conteudoDoPilar = {
    'paleta-de-cores': () => paleta.length > 0,
    tipografia: () => Boolean(tipografia.primaria),
  }

  const temConteudo =
    conteudoDoPilar[pilarAtual.slug]?.() ?? Boolean(uploads[pilarAtual.slug]?.principal)

  // Com a paleta já preenchida, "Não tenho, pular" sai de cena.
  const mostrarPular = !(ehPaleta && paleta.length > 0)

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
    if (passo === 1) sairDoFluxo()
    else setPasso((atual) => atual - 1)
  }

  const avancar = () => {
    if (passo === total) concluir()
    else setPasso((atual) => atual + 1)
  }

  return (
    <div className={s.pagina}>
      {/* O topo mostra o tema do passo atual, não o nome do pilar. */}
      <FlowTopBar titulo={pilarAtual.titulo} onFechar={sairDoFluxo} />

      {/* Só esta área rola. Os passos restantes entram no switch acima. */}
      <main className={s.conteudo}>
        <div className={s.grade}>
          <div className={s.centro}>{conteudoDoPasso()}</div>
        </div>
      </main>

      <FlowBottomBar
        passo={passo}
        total={total}
        temConteudo={temConteudo}
        mostrarPular={mostrarPular}
        onVoltar={voltar}
        onPular={avancar}
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
