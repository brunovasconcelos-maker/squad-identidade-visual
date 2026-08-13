/*
 * Fontes enviadas pela pessoa, como alternativa à busca no Google Fonts.
 *
 * O objeto devolvido tem a mesma forma do de `criarFonte` — família, categoria,
 * origem e a lista de variantes com `marcado` —, e é isso que deixa o card, a
 * prévia, os checkboxes e a página do tema funcionarem sem saber de onde a
 * fonte veio. O que ele tem a mais é `arquivos`, com os bytes de cada peso.
 *
 * O JSZip e o opentype.js entram por `import()` dentro das funções, e não no
 * topo: juntos passam de 300 KB, e quem só busca no Google Fonts não deveria
 * baixá-los. O Vite os separa em chunks próprios, carregados no primeiro
 * upload.
 */
export const ORIGEM_PROPRIA = 'Arquivo enviado'

export const EXTENSOES = ['.ttf', '.otf', '.woff', '.woff2']
export const ACCEPT = [...EXTENSOES, '.zip'].join(',')

const NOMES_DE_PESO = {
  100: 'Thin',
  200: 'Extralight',
  300: 'Light',
  400: 'Regular',
  500: 'Medium',
  600: 'Semibold',
  700: 'Bold',
  800: 'Extrabold',
  900: 'Black',
}

// Do rótulo escrito à mão de volta para o número, quando a detecção falha.
const PESOS_POR_NOME = {
  thin: 100,
  hairline: 100,
  extralight: 200,
  ultralight: 200,
  light: 300,
  regular: 400,
  normal: 400,
  book: 400,
  medium: 500,
  semibold: 600,
  demibold: 600,
  bold: 700,
  extrabold: 800,
  ultrabold: 800,
  black: 900,
  heavy: 900,
}

export const ehArquivoDeFonte = (nome) =>
  EXTENSOES.some((extensao) => nome.toLowerCase().endsWith(extensao))

export const ehZip = (arquivo) => /\.zip$/i.test(arquivo.name)

/** "Bold 700", "Bold 700 Italic" — o mesmo rótulo dos pesos do Google Fonts. */
export function rotuloDoPeso(peso, italico) {
  const nome = NOMES_DE_PESO[peso] ?? peso
  return italico ? `${nome} ${peso} Italic` : `${nome} ${peso}`
}

/**
 * Peso e itálico a partir de um rótulo escrito à mão.
 *
 * Aceita o número solto ("700"), o nome ("Bold") ou os dois ("Bold 700"), e
 * marca itálico por palavra. Sem nada reconhecível fica em 400, que é o que a
 * maioria dos arquivos avulsos é.
 */
export function lerRotulo(texto) {
  const limpo = texto.trim().toLowerCase()
  const italico = /it[áa]lic/.test(limpo)

  const numero = limpo.match(/\b([1-9]00)\b/)
  if (numero) return { peso: Number(numero[1]), italico }

  const nome = Object.keys(PESOS_POR_NOME).find((chave) => limpo.includes(chave))
  return { peso: nome ? PESOS_POR_NOME[nome] : 400, italico }
}

/**
 * Os arquivos de fonte de dentro de um .zip.
 *
 * O que não for fonte é ignorado em silêncio — um zip de fonte comprada vem
 * cheio de licença, leia-me e a pasta do macOS. Um zip sem fonte nenhuma é erro
 * de quem chama, que sabe como avisar.
 */
export async function extrairDoZip(arquivo) {
  const { default: JSZip } = await import('jszip')
  const zip = await JSZip.loadAsync(arquivo)

  const entradas = Object.values(zip.files).filter(
    (entrada) =>
      !entrada.dir &&
      ehArquivoDeFonte(entrada.name) &&
      // O macOS guarda um par "__MACOSX/._Fonte.ttf" que não é fonte nenhuma.
      !entrada.name.split('/').pop().startsWith('._'),
  )

  return Promise.all(
    entradas.map(async (entrada) => {
      const bytes = await entrada.async('arraybuffer')
      const nome = entrada.name.split('/').pop()
      return new File([bytes], nome)
    }),
  )
}

/**
 * Família, peso e itálico lidos de dentro do arquivo, ou null quando não dá.
 *
 * O opentype.js lê TTF, OTF e WOFF; WOFF2 ele não abre, e arquivo corrompido
 * também não. Nos dois casos a resposta é null, e quem chama oferece o campo
 * para a pessoa escrever o peso à mão — detecção que falha não pode barrar o
 * upload.
 *
 * `familia` vem separada de `temPeso` de propósito: subset de fonte costuma sair
 * sem a tabela de nomes mas com o OS/2 inteiro, e seria bobagem descartar um
 * peso que está ali só porque o nome não está.
 */
export async function lerMetadados(arquivo) {
  try {
    const { parse } = await import('opentype.js')
    const fonte = parse(await arquivo.arrayBuffer())

    const familia = nomeDaTabela(fonte.names, ['preferredFamily', 'fontFamily'])
    const subfamilia = nomeDaTabela(fonte.names, ['preferredSubfamily', 'fontSubfamily']) ?? ''

    const peso = fonte.tables?.os2?.usWeightClass
    const temPeso = Number.isFinite(peso) && peso >= 100 && peso <= 900

    return {
      familia,
      peso: temPeso ? peso : 400,
      italico: /it[\u00e1a]lic/i.test(subfamilia) || (fonte.tables?.post?.italicAngle ?? 0) !== 0,
      temPeso,
    }
  } catch {
    return null
  }
}

/*
 * O nome pedido, de qualquer plataforma e idioma.
 *
 * A tabela do opentype.js v2 vem agrupada por plataforma
 * (`names.windows.fontFamily.en`), e nem todo arquivo traz as três. Daí varrer
 * as plataformas em vez de ler uma só.
 */
function nomeDaTabela(names, chaves) {
  const plataformas = [names?.windows, names?.unicode, names?.macintosh].filter(Boolean)

  for (const plataforma of plataformas) {
    for (const chave of chaves) {
      const registro = plataforma[chave]
      const valor = registro?.en ?? (registro ? Object.values(registro)[0] : null)
      if (typeof valor === 'string' && valor.trim()) return valor.trim()
    }
  }
  return null
}

/**
 * Lê os arquivos e devolve uma linha por arquivo para a tela de conferência.
 *
 * `detectado` diz se o peso saiu do arquivo ou se ainda precisa ser escrito, e
 * é o que decide se a linha mostra um rótulo ou um campo.
 */
export async function analisar(arquivos) {
  return Promise.all(
    arquivos.map(async (arquivo) => {
      const meta = await lerMetadados(arquivo)
      const detectado = Boolean(meta?.temPeso)

      return {
        id: crypto.randomUUID(),
        arquivo,
        familia: meta?.familia ?? null,
        peso: meta?.peso ?? 400,
        italico: meta?.italico ?? false,
        detectado,
        // Só as não detectadas começam com o campo vazio, para a pessoa
        // escrever; as detectadas já vêm com o rótulo pronto.
        rotulo: detectado ? rotuloDoPeso(meta.peso, meta.italico) : '',
        marcado: true,
      }
    }),
  )
}

/** O nome que a tela de conferência sugere: o do primeiro arquivo que abriu. */
export function familiaSugerida(linhas, reserva = '') {
  return linhas.find((linha) => linha.familia)?.familia ?? reserva
}

/**
 * A fonte pronta para o estado do fluxo, com os bytes de cada peso.
 *
 * A chave da variante segue a do Google Fonts ("700", "700i"), com um sufixo
 * quando duas linhas caem no mesmo peso — dois arquivos "Regular" no mesmo zip
 * não podem virar uma variante só, senão um deles some da lista.
 */
export function criarFontePropria(familia, linhas, bytesPorId) {
  const usadas = new Set()

  const escolhidas = linhas.filter((linha) => linha.marcado)

  const variantes = escolhidas.map((linha) => {
    const { peso, italico } = linha.detectado
      ? { peso: linha.peso, italico: linha.italico }
      : lerRotulo(linha.rotulo)

    let chave = `${peso}${italico ? 'i' : ''}`
    while (usadas.has(chave)) chave += '+'
    usadas.add(chave)

    // O rótulo é sempre o canônico, mesmo vindo de texto escrito à mão: quem
    // digita "Bold" recebe "Bold 700", e a lista do card fica igual à de uma
    // fonte do Google em vez de misturar dois jeitos de nomear a mesma coisa.
    // É também o peso que vai de fato para o FontFace.
    return { chave, peso, italico, rotulo: rotuloDoPeso(peso, italico), marcado: true }
  })

  return {
    familia: familia.trim(),
    categoria: ORIGEM_PROPRIA,
    origem: ORIGEM_PROPRIA,
    variantes,
    arquivos: escolhidas.map((linha, i) => ({
      chave: variantes[i].chave,
      ...bytesPorId.get(linha.id),
    })),
  }
}

/** A fonte veio de upload? É o que decide entre o FontFace e o embed do Google. */
export const ehFontePropria = (fonte) => Boolean(fonte?.arquivos?.length)
