import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import FlowTopBar from '../components/FlowTopBar.jsx'
import FlowBottomBar from '../components/FlowBottomBar.jsx'
import PassoLogo from '../steps/PassoLogo.jsx'
import PassoIcone from '../steps/PassoIcone.jsx'
import useUploads from '../hooks/useUploads.js'
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
  const { uploads, salvar } = useUploads()

  const pilarAtual = pilares[passo - 1]

  // Só habilita o "Continuar" quando o arquivo principal do passo existe. As
  // variações preta e branca são opcionais. Passos ainda sem conteúdo não têm
  // entrada em uploads, então seguem desabilitados.
  const temConteudo = Boolean(uploads[pilarAtual.slug]?.principal)

  const conteudoDoPasso = () => {
    const props = {
      arquivos: uploads[pilarAtual.slug],
      onSalvar: (tipo, arquivo) => salvar(pilarAtual.slug, tipo, arquivo),
    }

    switch (pilarAtual.slug) {
      case 'logo':
        return <PassoLogo {...props} />
      case 'icone':
        return <PassoIcone {...props} />
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
      <FlowTopBar titulo="Identidade Visual" onFechar={sairDoFluxo} />

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
