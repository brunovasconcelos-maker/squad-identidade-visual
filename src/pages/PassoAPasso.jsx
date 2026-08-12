import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import Carregando, { DURACAO_TOTAL } from '../components/Carregando.jsx'
import FalhaAoSalvar from '../components/FalhaAoSalvar.jsx'
import FlowTopBar from '../components/FlowTopBar.jsx'
import FlowBottomBar from '../components/FlowBottomBar.jsx'
import PassoLogo from '../steps/PassoLogo.jsx'
import PassoIcone from '../steps/PassoIcone.jsx'
import PassoPaleta from '../steps/PassoPaleta.jsx'
import PassoTipografia from '../steps/PassoTipografia.jsx'
import PassoTomDeVoz from '../steps/PassoTomDeVoz.jsx'
import PassoFotografia from '../steps/PassoFotografia.jsx'
import PassoPersonalidade from '../steps/PassoPersonalidade.jsx'
import PassoElementos from '../steps/PassoElementos.jsx'
import useFluxo from '../hooks/useFluxo.js'
import { pilares, temas } from '../data/pilares.js'
import { CATEGORIAS, totalDeFotos } from '../data/fotografia.js'
import { eixosDefinidos } from '../data/personalidade.js'
import s from './PassoAPasso.module.css'

// No Figma esses passos têm 808px de conteúdo, mais que as 6 colunas centrais
// (670px) usadas pelos demais. Ver .centroLargo no CSS.
const PASSOS_LARGOS = ['fotografia', 'personalidade', 'elementos']

// A tela de espera fica até as cinco mensagens passarem, mesmo que a gravação
// termine antes — que é o normal, ela leva milissegundos.
const ESPERA_MINIMA = DURACAO_TOTAL

/**
 * O que conta como conteúdo em cada passo — a mesma regra nos dois modos, para
 * o "Continuar" do fluxo e o "Salvar" da edição avulsa não discordarem.
 *
 * Nos passos de arquivo basta o principal; na paleta, ao menos uma cor; na
 * tipografia, a fonte primária; no tom de voz, ao menos um tom; na
 * personalidade, ao menos um eixo escolhido. A Fotografia é a única sempre
 * pronta: percorrer as categorias não exige escolher foto.
 */
function temConteudoDoPasso(slug, estado) {
  const regras = {
    'paleta-de-cores': () => estado.paleta.length > 0,
    tipografia: () => Boolean(estado.tipografia.primaria),
    'tom-de-voz': () => estado.tomDeVoz.length > 0,
    fotografia: () => true,
    // Basta um eixo escolhido; os outros podem ficar sem valor.
    personalidade: () => eixosDefinidos(estado.personalidade).length > 0,
    elementos: () => estado.elementos.length > 0,
  }

  return regras[slug]?.() ?? Boolean(estado.uploads[slug]?.principal)
}

/**
 * As telas internas da Fotografia (seleção por categoria e resumo).
 *
 * Os dois modos caminham por elas do mesmo jeito; o que muda é só o que
 * acontece ao chegar no fim. Por isso `avancar` e `voltar` devolvem se o passo
 * acabou, e quem chama decide se avança de tema, salva ou vai para a Home.
 */
function telasDaFotografia(fotografia, acoes) {
  const indiceDaAba = CATEGORIAS.findIndex((c) => c.id === fotografia.aba)
  const noResumo = fotografia.tela === 'resumo'

  return {
    /** true quando não há mais tela interna pela frente. */
    avancar() {
      if (noResumo) return true

      // Ainda há categoria pela frente: só troca de aba.
      if (indiceDaAba < CATEGORIAS.length - 1) {
        acoes.irParaAba(CATEGORIAS[indiceDaAba + 1].id)
        return false
      }

      // Última categoria: com fotos vai para o resumo, sem nenhuma não há o
      // que resumir e o passo termina aqui.
      if (totalDeFotos(fotografia.selecoes) > 0) {
        acoes.irParaTela('resumo')
        return false
      }
      return true
    },

    /** true quando não há mais tela interna atrás. */
    voltar() {
      if (noResumo) {
        acoes.irParaTela('selecao')
        acoes.irParaAba(CATEGORIAS[CATEGORIAS.length - 1].id)
        return false
      }
      if (indiceDaAba > 0) {
        acoes.irParaAba(CATEGORIAS[indiceDaAba - 1].id)
        return false
      }
      return true
    },
  }
}

/** O conteúdo de um passo, igual nos dois modos. */
function ConteudoDoPasso({ slug, fluxo }) {
  const arquivos = fluxo.uploads[slug]
  const props = {
    arquivos,
    onSalvar: (tipo, arquivo) => fluxo.salvarUpload(slug, tipo, arquivo),
    onRemover: (tipo) => fluxo.removerUpload(slug, tipo),
  }

  switch (slug) {
    case 'logo':
      return <PassoLogo {...props} />
    case 'icone':
      return <PassoIcone {...props} />
    case 'paleta-de-cores':
      return <PassoPaleta paleta={fluxo.paleta} acoes={fluxo.acoesDaPaleta} />
    case 'tipografia':
      return <PassoTipografia tipografia={fluxo.tipografia} acoes={fluxo.acoesDaTipografia} />
    case 'tom-de-voz':
      return <PassoTomDeVoz tons={fluxo.tomDeVoz} acoes={fluxo.acoesDoTomDeVoz} />
    case 'fotografia':
      return <PassoFotografia fotografia={fluxo.fotografia} acoes={fluxo.acoesDaFotografia} />
    case 'personalidade':
      return (
        <PassoPersonalidade personalidade={fluxo.personalidade} acoes={fluxo.acoesDaPersonalidade} />
      )
    case 'elementos':
      return <PassoElementos elementos={fluxo.elementos} acoes={fluxo.acoesDosElementos} />
    default:
      return null
  }
}

/** A área central, com a largura que o passo pede. */
function AreaDoPasso({ slug, fluxo }) {
  return (
    <main className={s.conteudo}>
      <div className={s.grade}>
        {/* A Fotografia usa um bloco mais largo: a grade 3x3 tem 808px no
            Figma, e não cabe nas 6 colunas centrais dos outros passos. */}
        <div className={PASSOS_LARGOS.includes(slug) ? s.centroLargo : s.centro}>
          <ConteudoDoPasso slug={slug} fluxo={fluxo} />
        </div>
      </div>
    </main>
  )
}

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
  const fluxo = useFluxo()
  const { carregando, finalizar } = fluxo

  const pilarAtual = pilares[passo - 1]
  const temConteudo = temConteudoDoPasso(pilarAtual.slug, fluxo)

  // Regra do fluxo inteiro: "Não tenho, pular" e "Continuar" nunca aparecem
  // habilitados ao mesmo tempo. Assim que o passo tem conteúdo, o pular some
  // de vez — não fica desabilitado. Vale para todos os passos, inclusive os
  // que ainda serão construídos, então é uma expressão só e não caso a caso.
  const mostrarPular = !temConteudo

  // A Fotografia tem telas internas: a barra de progresso não anda ao passar
  // da seleção para o resumo, só quando o passo termina.
  const fotos =
    pilarAtual.slug === 'fotografia'
      ? telasDaFotografia(fluxo.fotografia, fluxo.acoesDaFotografia)
      : null

  // Sair do fluxo desmonta este componente, e com ele o estado dos uploads.
  // É o que faz o X e o "Voltar" do passo 1 descartarem o que foi enviado.
  const sairDoFluxo = () => navigate('/')

  // A única gravação do fluxo completo. Enquanto grava, a tela de espera fica
  // no lugar do passo; depois a Home já lê o que acabou de ser salvo.
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

  const proximoPasso = () => {
    if (passo === total) concluir()
    else setPasso((atual) => atual + 1)
  }

  const voltar = () => {
    // Havendo tela interna atrás, é para ela que se volta.
    if (fotos && !fotos.voltar()) return
    if (passo === 1) sairDoFluxo()
    else setPasso((atual) => atual - 1)
  }

  const avancar = () => {
    if (!fotos || fotos.avancar()) proximoPasso()
  }

  // "Não tenho, pular" na Fotografia salta o passo inteiro, sem passar pelo
  // resumo — que estaria vazio de qualquer forma.
  const pular = () => proximoPasso()

  // Enquanto lê o que já foi salvo, e enquanto grava no fim, a tela de espera
  // ocupa o lugar do fluxo.
  if (carregando) return <Carregando mensagens={['Abrindo seu manual...']} />
  if (salvando) return <Carregando />
  if (erroAoSalvar) {
    return (
      <FalhaAoSalvar erro={erroAoSalvar} onTentarDeNovo={concluir} onDescartar={sairDoFluxo} />
    )
  }

  return (
    <div className={s.pagina}>
      {/* O topo mostra o tema do passo atual, não o nome do pilar. */}
      <FlowTopBar titulo={pilarAtual.titulo} onFechar={sairDoFluxo} />

      <AreaDoPasso slug={pilarAtual.slug} fluxo={fluxo} />

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

/**
 * Edição avulsa: entrar direto num tema por /passo-a-passo/:tema, que é para
 * onde vai um card vazio da Home.
 *
 * Aqui não existe "próximo tema": some a barra de progresso, some o "Não
 * tenho, pular" (não há para onde pular) e o "Continuar" vira "Salvar", que
 * grava só este tema e volta para a Home. O que habilita o botão é a mesma
 * regra por passo do fluxo completo.
 */
function FluxoDeUmTema({ tema }) {
  const navigate = useNavigate()
  const [salvando, setSalvando] = useState(false)
  const [erroAoSalvar, setErroAoSalvar] = useState(null)
  const fluxo = useFluxo()
  const { carregando, salvarTema } = fluxo

  const pilar = pilares.find((item) => item.slug === tema)

  const fotos =
    tema === 'fotografia' ? telasDaFotografia(fluxo.fotografia, fluxo.acoesDaFotografia) : null

  const paraHome = () => navigate('/')

  const salvar = async () => {
    setErroAoSalvar(null)
    setSalvando(true)

    try {
      await salvarTema(tema)
    } catch (erro) {
      console.error(`Não foi possível salvar o tema "${tema}".`, erro)
      setSalvando(false)
      setErroAoSalvar(erro)
      return
    }

    navigate('/')
  }

  if (!pilar) {
    return (
      <section className="page">
        <h1>Passo a Passo</h1>
        <p className="page-placeholder">Tema desconhecido: “{tema}”.</p>
      </section>
    )
  }

  if (carregando) return <Carregando mensagens={['Abrindo seu manual...']} />
  if (erroAoSalvar) {
    return (
      <FalhaAoSalvar erro={erroAoSalvar} onTentarDeNovo={salvar} onDescartar={paraHome} />
    )
  }

  // O "Voltar" não anda entre temas — não há um anterior. Volta para a Home,
  // a menos que o próprio tema tenha uma tela interna atrás (o resumo da
  // Fotografia), que continua funcionando como no fluxo completo.
  const voltar = () => {
    if (fotos && !fotos.voltar()) return
    paraHome()
  }

  const acao = () => {
    if (!fotos || fotos.avancar()) salvar()
  }

  return (
    <div className={s.pagina}>
      <FlowTopBar titulo={pilar.titulo} onFechar={paraHome} />

      <AreaDoPasso slug={pilar.slug} fluxo={fluxo} />

      <FlowBottomBar
        temConteudo={temConteudoDoPasso(pilar.slug, fluxo)}
        mostrarProgresso={false}
        mostrarPular={false}
        rotulo="Salvar"
        ocupado={salvando}
        onVoltar={voltar}
        onContinuar={acao}
      />
    </div>
  )
}
