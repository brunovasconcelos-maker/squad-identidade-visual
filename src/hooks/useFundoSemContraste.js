import { useEffect, useState } from 'react'
import { corDominante, fundoQuaseIgual } from '../lib/corDaImagem.js'

/**
 * O fundo do exemplo de "não use sem contraste": quase a cor dominante da
 * própria marca, para o erro ficar evidente com qualquer arquivo enviado.
 *
 * Devolve null enquanto mede e também quando não dá para medir; nesse caso a
 * moldura fica com o fundo de reserva do CSS.
 */
export default function useFundoSemContraste(url) {
  const [fundo, setFundo] = useState(null)

  useEffect(() => {
    if (!url) {
      setFundo(null)
      return undefined
    }

    // A medição é assíncrona: se a marca trocar no meio do caminho, o
    // resultado da anterior não pode chegar depois e vencer.
    let atual = true
    setFundo(null)

    corDominante(url)
      .then((hex) => {
        if (atual && hex) setFundo(`#${fundoQuaseIgual(hex)}`)
      })
      .catch(() => {
        // Sem medição, fica o fundo de reserva.
      })

    return () => {
      atual = false
    }
  }, [url])

  return fundo
}
