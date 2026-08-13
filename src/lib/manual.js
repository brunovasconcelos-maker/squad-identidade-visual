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
import { eixosDefinidos, EIXOS } from '../data/personalidade.js'
import { TIPOS_ARQUIVO, PASSOS_COM_UPLOAD } from '../data/uploads.js'

/*
 * Um arquivo guardado é { nome, tipo, tamanho, bytes }, com `bytes` sendo um
 * ArrayBuffer — não um File nem um Blob.
 *
 * O motivo é duplo. Guardar File/Blob no IndexedDB não é confiável em todos os
 * navegadores (o Safari tem buracos antigos nisso), enquanto ArrayBuffer é
 * clonável e gravável em qualquer um. E ler os bytes na hora do upload, em vez
 * de segurar a referência do arquivo até o fim do fluxo, tira a dependência de
 * o arquivo continuar legível no disco minutos depois — se falhar, falha na
 * hora de escolher, onde dá para tentar de novo, e não na finalização, onde
 * custa tudo.
 */
export async function lerArquivo(arquivo) {
  return {
    nome: arquivo.name,
    tipo: arquivo.type,
    tamanho: arquivo.size,
    bytes: await arquivo.arrayBuffer(),
  }
}

const semUrl = (registro) =>
  registro
    ? {
        nome: registro.nome,
        tipo: registro.tipo,
        tamanho: registro.tamanho,
        bytes: registro.bytes,
      }
    : null

/**
 * Recria a object URL a partir dos bytes. Aceita também o formato antigo, que
 * guardava um Blob em `arquivo`, para um manual salvo antes desta mudança
 * continuar abrindo.
 */
export function comUrl(registro) {
  if (!registro) return null

  const blob = registro.bytes
    ? new Blob([registro.bytes], { type: registro.tipo || '' })
    : registro.arquivo

  if (!blob) return null
  return { ...registro, url: URL.createObjectURL(blob) }
}

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
    tomDeVoz: fluxo.tomDeVoz,
    fotografia: fluxo.fotografia,
    personalidade: fluxo.personalidade,
    elementos: fluxo.elementos.map((elemento) => ({
      id: elemento.id,
      nome: elemento.nome,
      arquivo: semUrl(elemento.arquivo),
    })),
    variacoesDaLogo: fluxo.variacoesDaLogo.map((variacao) => ({
      id: variacao.id,
      nome: variacao.nome,
      regras: variacao.regras,
      arquivo: semUrl(variacao.arquivo),
    })),
  }
}

/**
 * O pedaço do manual que pertence a um tema só, pronto para ser espalhado
 * sobre o que já estava salvo.
 *
 * É o que permite salvar um tema sem passar por cima dos outros: a edição
 * avulsa (entrar pela Home num card vazio) grava só a sua fatia, e o resto do
 * manual continua exatamente como estava no disco. `salvo` é o manual lido do
 * IndexedDB, ou null quando ainda não existe nenhum.
 *
 * Logo e Ícone dividem o mesmo `uploads`, então esses dois recompõem o objeto
 * inteiro em vez de trocá-lo: a chave do tema vem do fluxo, as demais vêm do
 * disco.
 */
export function fatiaDoTema(fluxo, slug, salvo) {
  const completo = paraArmazenamento(fluxo)

  switch (slug) {
    case 'logo':
    case 'icone': {
      const uploads = {
        ...completo.uploads,
        ...(salvo?.uploads ?? {}),
        [slug]: completo.uploads[slug],
      }
      // As variações são da logo, e só dela: editando o Ícone avulso elas
      // ficam como estavam no disco.
      return slug === 'logo'
        ? { uploads, variacoesDaLogo: completo.variacoesDaLogo }
        : { uploads }
    }
    case 'paleta-de-cores':
      return { paleta: completo.paleta }
    case 'tipografia':
      return { tipografia: completo.tipografia }
    case 'tom-de-voz':
      return { tomDeVoz: completo.tomDeVoz }
    case 'fotografia':
      return { fotografia: completo.fotografia }
    case 'personalidade':
      return { personalidade: completo.personalidade }
    case 'elementos':
      return { elementos: completo.elementos }
    default:
      return {}
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
    tomDeVoz: manual.tomDeVoz ?? [],
    fotografia: manual.fotografia ?? { selecoes: {}, tela: 'selecao' },
    personalidade: manual.personalidade ?? {},
    elementos: (manual.elementos ?? []).map((elemento) => ({
      ...elemento,
      arquivo: comUrl(elemento.arquivo),
    })),
    variacoesDaLogo: (manual.variacoesDaLogo ?? []).map((variacao) => ({
      ...variacao,
      arquivo: comUrl(variacao.arquivo),
    })),
  }
}

const arquivosDoPasso = (manual, passo) =>
  TIPOS_ARQUIVO.filter((tipo) => manual.uploads?.[passo]?.[tipo]).length

/**
 * O que conta como tema preenchido. É o mesmo critério que habilita o
 * "Continuar" de cada passo, para a Home não discordar do fluxo.
 *
 */
const COMPLETO = {
  logo: (m) => arquivosDoPasso(m, 'logo') > 0,
  icone: (m) => arquivosDoPasso(m, 'icone') > 0,
  'paleta-de-cores': (m) => (m.paleta?.length ?? 0) > 0,
  tipografia: (m) => Boolean(m.tipografia?.primaria),
  'tom-de-voz': (m) => (m.tomDeVoz?.length ?? 0) > 0,
  fotografia: (m) => totalDeFotos(m.fotografia?.selecoes ?? {}) > 0,
  personalidade: (m) => eixosDefinidos(m.personalidade).length > 0,
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
    case 'tom-de-voz':
      return plural(manual.tomDeVoz?.length ?? 0, 'tom criado', 'tons criados')
    case 'fotografia':
      return plural(totalDeFotos(manual.fotografia?.selecoes ?? {}), 'selecionada', 'selecionadas')
    case 'personalidade':
      return `${eixosDefinidos(manual.personalidade).length} de ${EIXOS.length} preenchidas`
    case 'elementos':
      return plural(manual.elementos?.length ?? 0, 'adicionado', 'adicionados')
    default:
      return null
  }
}
