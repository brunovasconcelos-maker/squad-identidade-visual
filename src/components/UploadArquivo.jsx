import { useEffect, useRef, useState } from 'react'
import Icon from './Icon.jsx'
import { normalizarArquivoDeImagem } from '../lib/svg.js'
import s from './UploadArquivo.module.css'

const TIPOS_ACEITOS = ['image/png', 'image/svg+xml']
const ACCEPT = '.png,.svg,image/png,image/svg+xml'

// Alguns sistemas não preenchem o MIME de SVG, então a extensão vale também.
function arquivoValido(arquivo) {
  return TIPOS_ACEITOS.includes(arquivo.type) || /\.(png|svg)$/i.test(arquivo.name)
}

/**
 * Área de upload de um arquivo (logo, ícone, o que vier): clique abre o
 * seletor do sistema, arrastar um arquivo válido também funciona. Preenchida,
 * mostra a prévia e um lápis na borda direita para trocar o arquivo.
 *
 * `fundo` define o fundo da prévia depois de preenchida:
 * 'padrao' (cinza), 'branco' (branco com borda cinza, para a versão preta) ou
 * 'preto' (para a versão branca aparecer).
 */
export default function UploadArquivo({ titulo, instrucao, arquivo: logo, fundo = 'padrao', onArquivo }) {
  const inputRef = useRef(null)
  const [arrastando, setArrastando] = useState(false)
  const [erro, setErro] = useState(null)
  const [previaFalhou, setPreviaFalhou] = useState(false)

  const preenchido = Boolean(logo)

  // Cada arquivo novo merece uma chance de aparecer.
  useEffect(() => {
    setPreviaFalhou(false)
  }, [logo?.url])

  const abrirSeletor = () => inputRef.current?.click()

  const receber = async (arquivo) => {
    if (!arquivo) return

    if (!arquivoValido(arquivo)) {
      setErro('Formato não aceito. Envie um arquivo PNG ou SVG.')
      return
    }

    setErro(null)
    onArquivo(await normalizarArquivoDeImagem(arquivo))
  }

  const aoSoltar = (evento) => {
    evento.preventDefault()
    setArrastando(false)
    receber(evento.dataTransfer.files?.[0])
  }

  const classesCaixa = [
    s.caixa,
    preenchido ? s.preenchida : s.vazia,
    preenchido && s[fundo],
    arrastando && s.arrastando,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <section className={s.secao}>
      <div className={s.cabecalho}>
        <h2 className={s.titulo}>{titulo}</h2>

        {preenchido && (
          <button
            type="button"
            className={s.botaoIcone}
            onClick={abrirSeletor}
            aria-label={`Trocar ${titulo}`}
          >
            <Icon nome="Edit" />
          </button>
        )}
      </div>

      <div
        className={classesCaixa}
        onDragOver={(evento) => {
          evento.preventDefault()
          setArrastando(true)
        }}
        onDragLeave={() => setArrastando(false)}
        onDrop={aoSoltar}
      >
        {preenchido && previaFalhou ? (
          // Sem isso o browser desenharia o ícone de imagem quebrada aqui.
          <p className={s.falhaPrevia}>
            Não foi possível exibir este arquivo. Tente outro PNG ou SVG.
          </p>
        ) : preenchido ? (
          <img
            src={logo.url}
            alt={`Prévia — ${titulo}`}
            className={s.previa}
            onError={() => setPreviaFalhou(true)}
          />
        ) : (
          <button type="button" className={s.alvo} onClick={abrirSeletor}>
            <Icon nome="File-Upload" tamanho={40} />
            <span className={s.instrucao}>
              {instrucao}
              <br />
              Você pode adicionar arquivos PNG ou SVG.
            </span>
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className={s.input}
          onChange={(evento) => {
            receber(evento.target.files?.[0])
            // Permite reenviar o mesmo arquivo logo em seguida.
            evento.target.value = ''
          }}
        />
      </div>

      {erro && (
        <p className={s.erro} role="alert">
          {erro}
        </p>
      )}
    </section>
  )
}
