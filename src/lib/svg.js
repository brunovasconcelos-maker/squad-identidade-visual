const NAMESPACE_SVG = 'http://www.w3.org/2000/svg'

function ehSvg(arquivo) {
  return /svg/i.test(arquivo.type) || /\.svg$/i.test(arquivo.name)
}

/**
 * Alguns exports de SVG saem sem o atributo `xmlns` no elemento raiz. O
 * arquivo abre normalmente num editor, mas o browser se recusa a desenhá-lo
 * dentro de um <img> — o resultado é o ícone de imagem quebrada.
 *
 * Aqui o namespace é reposto quando falta, para a prévia funcionar com o
 * arquivo que a pessoa realmente tem. Qualquer outro caso passa direto.
 */
export async function normalizarArquivoDeImagem(arquivo) {
  if (!ehSvg(arquivo)) return arquivo

  const texto = await arquivo.text()
  if (/<svg[^>]*\sxmlns\s*=/i.test(texto)) return arquivo

  // Preserva o texto da tag como está: SVG é XML, então trocar <SVG por <svg
  // deixaria a abertura sem par com o </SVG> e quebraria o arquivo.
  const corrigido = texto.replace(/<svg\b/i, (tag) => `${tag} xmlns="${NAMESPACE_SVG}"`)
  return new File([corrigido], arquivo.name, { type: 'image/svg+xml' })
}
