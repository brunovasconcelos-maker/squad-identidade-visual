import { useRef, useState } from 'react'
import Icon from './Icon.jsx'
import s from './UploadLogo.module.css'

const TIPOS_ACEITOS = ['image/png', 'image/svg+xml']
const ACCEPT = '.png,.svg,image/png,image/svg+xml'

// Alguns sistemas não preenchem o MIME de SVG, então a extensão vale também.
function arquivoValido(arquivo) {
  return TIPOS_ACEITOS.includes(arquivo.type) || /\.(png|svg)$/i.test(arquivo.name)
}

/**
 * Área de upload de um logo: clique abre o seletor do sistema, arrastar um
 * arquivo válido também funciona. Preenchida, mostra a prévia e um lápis ao
 * lado do título para trocar o arquivo.
 *
 * `fundo` define o fundo da prévia depois de preenchida:
 * 'padrao' (cinza), 'branco' (branco com borda cinza, para o logo preto) ou
 * 'preto' (para o logo branco aparecer).
 */
export default function UploadLogo({ titulo, logo, fundo = 'padrao', onArquivo }) {
  const inputRef = useRef(null)
  const [arrastando, setArrastando] = useState(false)
  const [erro, setErro] = useState(null)

  const preenchido = Boolean(logo)

  const abrirSeletor = () => inputRef.current?.click()

  const receber = (arquivo) => {
    if (!arquivo) return

    if (!arquivoValido(arquivo)) {
      setErro('Formato não aceito. Envie um arquivo PNG ou SVG.')
      return
    }

    setErro(null)
    onArquivo(arquivo)
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
        {preenchido ? (
          <img src={logo.url} alt={`Prévia — ${titulo}`} className={s.previa} />
        ) : (
          <button type="button" className={s.alvo} onClick={abrirSeletor}>
            <Icon nome="File-Upload" tamanho={40} />
            <span className={s.instrucao}>
              Faça upload ou arraste a logo pra cá
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
