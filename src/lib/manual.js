/*
 * O manual gravado: conversão entre o estado do fluxo (em memória) e o que vai
 * para o IndexedDB, mais as contas que a Home faz em cima do que foi salvo.
 *
 * A diferença entre as duas formas é só a object URL: em memória cada arquivo
 * tem `url` para a prévia; no disco fica só o Blob, e a URL é recriada na
 * leitura. Guardar a URL não adiantaria — ela morre com a aba.
 */
import { pilares } from '../data/pilares.js'
import { totalDeFotos } from '../data/fotografia.js'
import { EIXOS } from '../data/personalidade.js'
import { TIPOS_ARQUIVO, PASSOS_COM_UPLOAD } from '../data/uploads.js'

const semUrl = (registro) =>
  registro ? { nome: registro.nome, tipo: registro.tipo, arquivo: registro.arquivo } : null

const comUrl = (registro) =>
  registro?.arquivo ? { ...registro, url: URL.createObjectURL(registro.arquivo) } : null

export function paraArmazenamento(fluxo) {
  return {
    uploads: Object.fromEntries(
      PASSOS_COM_UPLOAD.map((passo) => [
        passo,
        Object.fromEntries(
          TIPOS_ARQUIVO.map((tipo) => [tipo, semUrl(fluxo.uploads[passo]?.[tipo])]),
        ),
      ]),
    ),
    paleta: fluxo.paleta,
    tipografia: fluxo.tipografia,
    fotografia: fluxo.fotografia,
    personalidade: fluxo.personalidade,
    elementos: fluxo.elementos.map((elemento) => ({
      id: elemento.id,
      nome: elemento.nome,
      arquivo: semUrl(elemento.arquivo),
    })),
  }
}

/**
 * Recria as object URLs. As URLs criadas aqui ficam vivas enquanto a página
 * estiver aberta; quem chama devolve a lista para liberar depois.
 */
export function deArmazenamento(manual) {
  if (!manual) return null

  return {
    uploads: Object.fromEntries(
      PASSOS_COM_UPLOAD.map((passo) => [
        passo,
        Object.fromEntries(
          TIPOS_ARQUIVO.map((tipo) => [tipo, comUrl(manual.uploads?.[passo]?.[tipo])]),
        ),
      ]),
    ),
    paleta: manual.paleta ?? [],
    tipografia: manual.tipografia ?? { primaria: null, secundarias: [] },
    fotografia: manual.fotografia ?? { selecoes: {}, tela: 'selecao' },
    personalidade: manual.personalidade ?? {},
    elementos: (manual.elementos ?? []).map((elemento) => ({
      ...elemento,
      arquivo: comUrl(elemento.arquivo),
    })),
  }
}

const arquivosDoPasso = (manual, passo) =>
  TIPOS_ARQUIVO.filter((tipo) => manual.uploads?.[passo]?.[tipo]).length

/**
 * O que conta como tema preenchido. É o mesmo critério que habilita o
 * "Continuar" de cada passo, para a Home não discordar do fluxo.
 *
 * A Personalidade é a exceção: os cinco eixos já nascem no meio, então o passo
 * nunca fica vazio e o tema conta como preenchido sempre que existe um manual.
 */
const COMPLETO = {
  logo: (m) => arquivosDoPasso(m, 'logo') > 0,
  icone: (m) => arquivosDoPasso(m, 'icone') > 0,
  'paleta-de-cores': (m) => (m.paleta?.length ?? 0) > 0,
  tipografia: (m) => Boolean(m.tipografia?.primaria),
  fotografia: (m) => totalDeFotos(m.fotografia?.selecoes ?? {}) > 0,
  personalidade: () => true,
  elementos: (m) => (m.elementos?.length ?? 0) > 0,
}

export function temaCompleto(manual, slug) {
  if (!manual) return false
  return COMPLETO[slug]?.(manual) ?? false
}

/** Percentual arredondado dos sete temas preenchidos. */
export function percentualPreenchido(manual) {
  if (!manual) return 0
  const completos = pilares.filter((pilar) => temaCompleto(manual, pilar.slug)).length
  return Math.round((completos / pilares.length) * 100)
}

/** O primeiro tema ainda não preenchido, para o "Continuar" da Home. */
export function primeiroTemaIncompleto(manual) {
  const indice = pilares.findIndex((pilar) => !temaCompleto(manual, pilar.slug))
  return indice === -1 ? null : { slug: pilares[indice].slug, passo: indice + 1 }
}

const plural = (quantidade, singular, pluralizado) =>
  `${quantidade} ${quantidade === 1 ? singular : pluralizado}`

/** A legenda de cada card preenchido na Home. */
export function resumoDoTema(manual, slug) {
  if (!manual) return null

  switch (slug) {
    case 'logo':
    case 'icone':
      return plural(arquivosDoPasso(manual, slug), 'arquivo', 'arquivos')
    case 'paleta-de-cores':
      return plural(manual.paleta?.length ?? 0, 'cor', 'cores')
    case 'tipografia': {
      const secundarias = manual.tipografia?.secundarias?.filter((vaga) => vaga.fonte).length ?? 0
      const primaria = manual.tipografia?.primaria?.familia
      if (!primaria) return null
      return secundarias > 0 ? `${primaria} + ${secundarias}` : primaria
    }
    case 'fotografia':
      return plural(totalDeFotos(manual.fotografia?.selecoes ?? {}), 'selecionada', 'selecionadas')
    case 'personalidade':
      return `${EIXOS.length} de ${EIXOS.length} preenchidas`
    case 'elementos':
      return plural(manual.elementos?.length ?? 0, 'adicionado', 'adicionados')
    default:
      return null
  }
}
