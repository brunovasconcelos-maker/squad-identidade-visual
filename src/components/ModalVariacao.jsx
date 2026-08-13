import { useEffect, useRef, useState } from 'react'
import Icon from './Icon.jsx'
import UploadArquivo from './UploadArquivo.jsx'
import s from './ModalVariacao.module.css'

/** As regras de uso cabem numa linha do cartão; daí o teto. */
export const MAXIMO_DAS_REGRAS = 120

/**
 * Modal de adicionar/editar uma variação da logo — nodes 6049:999 (vazio) e
 * 6049:1048 (preenchido) do Figma.
 *
 * Dois campos e a moldura de upload. A moldura é a mesma do "Logo principal"
 * (`UploadArquivo`), sem cabeçalho: aceita PNG e SVG, recusa o resto com a
 * mesma mensagem, e clicar nela troca o arquivo.
 *
 * Só devolve alguma coisa pelo `onSalvar`. Fechar pelo X, pelo "Voltar", pelo
 * Esc ou pelo fundo descarta tudo, inclusive o arquivo escolhido aqui dentro —
 * a variação que já existia continua como estava.
 */
export default function ModalVariacao({ variacao, onSalvar, onFechar }) {
  const [nome, setNome] = useState(variacao?.nome ?? '')
  const [regras, setRegras] = useState(variacao?.regras ?? '')
  // Só fica preenchido quando a pessoa escolhe um arquivo aqui dentro; nulo
  // significa "continua o que já estava".
  const [arquivoNovo, setArquivoNovo] = useState(null)
  // URL só para a prévia daqui; o registro definitivo nasce no useFluxo, se e
  // quando a pessoa salvar.
  const [urlDaPrevia, setUrlDaPrevia] = useState(null)
  const painelRef = useRef(null)

  const anexo = arquivoNovo
    ? { nome: arquivoNovo.name, tipo: arquivoNovo.type, url: urlDaPrevia }
    : variacao?.arquivo

  // Nome e arquivo bastam: as regras de uso são opcionais, como os demais
  // campos de apoio do fluxo.
  const pronto = Boolean(nome.trim()) && Boolean(anexo)

  useEffect(() => {
    if (!arquivoNovo) {
      setUrlDaPrevia(null)
      return undefined
    }

    const url = URL.createObjectURL(arquivoNovo)
    setUrlDaPrevia(url)
    return () => URL.revokeObjectURL(url)
  }, [arquivoNovo])

  useEffect(() => {
    const aoTeclar = (evento) => {
      if (evento.key === 'Escape') onFechar()
    }
    document.addEventListener('keydown', aoTeclar)
    return () => document.removeEventListener('keydown', aoTeclar)
  }, [onFechar])

  const salvar = () => onSalvar(nome.trim(), regras.trim(), arquivoNovo)

  return (
    <div
      className={s.fundo}
      onMouseDown={(evento) => {
        if (!painelRef.current?.contains(evento.target)) onFechar()
      }}
    >
      <div
        ref={painelRef}
        className={s.painel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-modal-variacao"
      >
        <div className={s.cabecalho}>
          <h2 id="titulo-modal-variacao" className={s.titulo}>
            Adicionar variação
          </h2>
          <button type="button" className={s.fechar} onClick={onFechar} aria-label="Fechar">
            <Icon nome="Close" />
          </button>
        </div>

        <Campo
          rotulo="Nome da Variação"
          dica="(Ex.: Horizontal, Cor)"
          valor={nome}
          onMudar={setNome}
          onEnter={() => pronto && salvar()}
          autoFoco
        />

        <Campo
          rotulo="Regras de Uso"
          dica="(Ex.: Usar em materiais horizontais)"
          valor={regras}
          onMudar={setRegras}
          onEnter={() => pronto && salvar()}
          maximo={MAXIMO_DAS_REGRAS}
        />

        <UploadArquivo
          instrucao="Faça upload ou arraste a logo pra cá"
          arquivo={anexo}
          onArquivo={setArquivoNovo}
        />

        <div className={s.rodape}>
          <button type="button" className={s.voltar} onClick={onFechar}>
            Voltar
          </button>
          <button type="button" className={s.continuar} onClick={salvar} disabled={!pronto}>
            Continuar
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Um campo do modal: a linha de texto com a dica embaixo.
 *
 * O lápis do Figma só aparece com o campo preenchido, que é a diferença entre
 * os dois nodes. Ele não liga nem desliga a edição — o texto já é editável o
 * tempo todo; clicar nele devolve o cursor ao fim do que está escrito, que é o
 * que a pessoa espera de um lápis ao lado de um texto.
 *
 * `maximo` corta o texto na digitação e mostra a contagem ao lado da dica. A
 * contagem só aparece depois da primeira letra, para o campo vazio continuar
 * igual ao Figma.
 */
function Campo({ rotulo, dica, valor, onMudar, onEnter, maximo, autoFoco = false }) {
  const campoRef = useRef(null)

  useEffect(() => {
    if (autoFoco) campoRef.current?.focus()
  }, [autoFoco])

  const focar = () => {
    const campo = campoRef.current
    if (!campo) return
    campo.focus()
    campo.setSelectionRange(campo.value.length, campo.value.length)
  }

  return (
    <div className={s.campo}>
      <div className={s.linhaCampo}>
        <input
          ref={campoRef}
          type="text"
          className={s.entrada}
          value={valor}
          maxLength={maximo}
          placeholder={rotulo}
          aria-label={rotulo}
          onChange={(evento) => onMudar(evento.target.value)}
          onKeyDown={(evento) => {
            if (evento.key === 'Enter') onEnter()
          }}
        />

        {valor && (
          <button
            type="button"
            className={s.lapis}
            onClick={focar}
            aria-label={`Editar ${rotulo}`}
          >
            <Icon nome="Edit" />
          </button>
        )}
      </div>

      <div className={s.linhaDica}>
        <p className={s.dica}>{dica}</p>
        {maximo && valor.length > 0 && (
          <p className={s.contagem}>
            {valor.length}/{maximo}
          </p>
        )}
      </div>
    </div>
  )
}
