import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import Carregando from '../components/Carregando.jsx'
import FalhaAoSalvar from '../components/FalhaAoSalvar.jsx'
import FlowTopBar from '../components/FlowTopBar.jsx'
import FlowBottomBar from '../components/FlowBottomBar.jsx'
import PassoLogo from '../steps/PassoLogo.jsx'
import PassoIcone from '../steps/PassoIcone.jsx'
import PassoPaleta from '../steps/PassoPaleta.jsx'
import PassoTipografia from '../steps/PassoTipografia.jsx'
import PassoFotografia from '../steps/PassoFotografia.jsx'
import PassoPersonalidade from '../steps/PassoPersonalidade.jsx'
import PassoElementos from '../steps/PassoElementos.jsx'
import useFluxo from '../hooks/useFluxo.js'
import { pilares, temas } from '../data/pilares.js'
import { totalDeFotos } from '../data/fotografia.js'
import s from './PassoAPasso.module.css'

// No Figma esses passos têm 808px de conteúdo, mais que as 6 colunas centrais
// (670px) usadas pelos demais. Ver .centroLargo no CSS.
const PASSOS_LARGOS = ['fotografia', 'personalidade', 'elementos']

// Tempo mínimo da tela de espera ao finalizar. Sem ele a gravação termina
// antes do primeiro quadro e a tela nem chega a aparecer.
const ESPERA_MINIMA = 700

export default function PassoAPasso() {
  const { tema } = useParams()

  // Sem :tema -> fluxo completo. Com :tema -> fluxo de um tema só.
  return tema ? <FluxoDeUmTema tema={tema} /> : <FluxoCompleto />
}

function FluxoCompleto() {
  const navigate = useNavigate()
  const total = pilares.length
  // A Home manda continuar no primeiro tema incompleto por ?passo=N.
  const [parametros] = useSearchParams()
  const passoInicial = Number(parametros.get('passo'))
  const [passo, setPasso] = useState(
    Number.isInteger(passoInicial) && passoInicial >= 1 && passoInicial <= pilares.length
      ? passoInicial
      : 1,
  )
  const [salvando, setSalvando] = useState(false)
  const [erroAoSalvar, setErroAoSalvar] = useState(null)
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
    elementos,
    acoesDosElementos,
    carregando,
    finalizar,
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
    elementos: () => elementos.length > 0,
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
      case 'elementos':
        return <PassoElementos elementos={elementos} acoes={acoesDosElementos} />
      default:
        return null
    }
  }

  // Sair do fluxo desmonta este componente, e com ele o estado dos uploads.
  // É o que faz o X e o "Voltar" do passo 1 descartarem o que foi enviado.
  const sairDoFluxo = () => navigate('/')

  // A única gravação do fluxo. Enquanto grava, a tela de espera fica no lugar
  // do passo; depois a Home já lê o que acabou de ser salvo.
  //
  // Gravar costuma levar poucos milissegundos, rápido demais para a tela de
  // espera chegar a ser pintada — daí o tempo mínimo, senão a transição parece
  // que não aconteceu.
  const concluir = async () => {
    setErroAoSalvar(null)
    setSalvando(true)
    const comecou = Date.now()

    try {
      await finalizar()
    } catch (erro) {
      console.error('Não foi possível salvar o manual.', erro)
      // Navegar mesmo assim mostraria uma Home vazia, indistinguível de um
      // salvamento que deu certo. Melhor ficar e dizer o que aconteceu.
      setSalvando(false)
      setErroAoSalvar(erro)
      return
    }

    const restante = ESPERA_MINIMA - (Date.now() - comecou)
    if (restante > 0) await new Promise((pronto) => setTimeout(pronto, restante))
    navigate('/')
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

  // Enquanto lê o que já foi salvo, e enquanto grava no fim, a tela de espera
  // ocupa o lugar do fluxo.
  if (carregando) return <Carregando mensagem="Abrindo seu manual…" />
  if (salvando) return <Carregando mensagem="Salvando seu manual…" />
  if (erroAoSalvar) {
    return (
      <FalhaAoSalvar
        erro={erroAoSalvar}
        onTentarDeNovo={concluir}
        onDescartar={sairDoFluxo}
      />
    )
  }

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
