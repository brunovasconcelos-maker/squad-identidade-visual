import { useEffect } from 'react'
import { ehFontePropria } from '../lib/fontesProprias.js'

/*
 * Carrega uma fonte enviada pela pessoa com a FontFace API.
 *
 * É o par do useFonteDoGoogle: lá a fonte vem de um <link> para o embed
 * público, aqui ela vem dos próprios bytes, um FontFace por peso. Nos dois
 * casos o resto do card não muda — ele só pede a família pelo nome no CSS.
 *
 * O registro conta quantos cards dependem de cada família, porque
 * `document.fonts` é global: dois cards com a mesma fonte não podem registrá-la
 * duas vezes, nem um deles removê-la enquanto o outro ainda a mostra.
 */
const registro = new Map()

async function adquirir(fonte) {
  const existente = registro.get(fonte.familia)
  if (existente) {
    existente.usos += 1
    return
  }

  const entrada = { usos: 1, faces: [] }
  registro.set(fonte.familia, entrada)

  await Promise.all(
    fonte.arquivos.map(async (arquivo) => {
      const variante = fonte.variantes.find((v) => v.chave === arquivo.chave)

      try {
        const face = new FontFace(fonte.familia, arquivo.bytes, {
          weight: String(variante?.peso ?? 400),
          style: variante?.italico ? 'italic' : 'normal',
        })
        await face.load()

        // Pode ter sido liberada enquanto o load corria.
        if (registro.get(fonte.familia) !== entrada) return
        document.fonts.add(face)
        entrada.faces.push(face)
      } catch (erro) {
        // Um peso que não carrega não derruba os outros: o navegador cai na
        // fonte de reserva só para ele.
        console.error(`Não foi possível carregar ${arquivo.nome}.`, erro)
      }
    }),
  )
}

function liberar(familia) {
  const entrada = registro.get(familia)
  if (!entrada) return

  entrada.usos -= 1
  if (entrada.usos > 0) return

  entrada.faces.forEach((face) => document.fonts.delete(face))
  registro.delete(familia)
}

/** @param {object|null} fonte A fonte do card, de qualquer origem. */
export default function useFontePropria(fonte) {
  const familia = ehFontePropria(fonte) ? fonte.familia : null

  useEffect(() => {
    if (!familia) return undefined

    adquirir(fonte)
    return () => liberar(familia)
    // A família identifica o registro; trocar a fonte por outra de mesmo nome
    // não muda o que está carregado.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [familia])
}
