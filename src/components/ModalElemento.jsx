import { useEffect, useRef, useState } from 'react'
import Icon from './Icon.jsx'
import s from './ModalElemento.module.css'

/**
 * Modal de adicionar/editar um elemento: um nome dado pela pessoa mais o
 * arquivo anexado.
 *
 * Só devolve alguma coisa pelo `onSalvar`. Fechar pelo X, pelo "Voltar", pelo
 * Esc ou pelo fundo descarta a tentativa inteira — inclusive a troca de
 * arquivo feita aqui dentro.
 */
export default function ModalElemento({
  elemento,
  arquivoInicial,
  onSalvar,
  onFechar,
  onEscolherArquivo,
}) {
  const [nome, setNome] = useState(elemento?.nome ?? '')
  // Só fica preenchido quando a pessoa troca o arquivo aqui dentro; nulo
  // significa "continua o que já estava".
  const [arquivoNovo, setArquivoNovo] = useState(arquivoInicial ?? null)
  // URL só para a prévia daqui; o registro definitivo é criado no useFluxo
  // quando (e se) a pessoa salvar.
  const [urlDaPrevia, setUrlDaPrevia] = useState(null)
  const campoRef = useRef(null)
  const painelRef = useRef(null)

  const anexo = arquivoNovo
    ? { nome: arquivoNovo.name, tipo: arquivoNovo.type, url: urlDaPrevia }
    : elemento?.arquivo

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
    campoRef.current?.focus()
  }, [])

  useEffect(() => {
    const aoTeclar = (evento) => {
      if (evento.key === 'Escape') onFechar()
    }
    document.addEventListener('keydown', aoTeclar)
    return () => document.removeEventListener('keydown', aoTeclar)
  }, [onFechar])

  // Sem anexo não há elemento: some o modal junto.
  const removerAnexo = () => onFechar()

  const trocarArquivo = async () => {
    const escolhido = await onEscolherArquivo()
    if (escolhido) setArquivoNovo(escolhido)
  }

  const salvar = () => onSalvar(nome.trim(), arquivoNovo)

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
        aria-labelledby="titulo-modal-elemento"
      >
        <div className={s.cabecalho}>
          <h2 id="titulo-modal-elemento" className={s.titulo}>
            Adicionar elemento
          </h2>
          <button type="button" className={s.fechar} onClick={onFechar} aria-label="Fechar">
            <Icon nome="Close" />
          </button>
        </div>

        <div className={s.campoNome}>
          <div className={s.linhaCampo}>
            <input
              ref={campoRef}
              type="text"
              className={s.entrada}
              value={nome}
              placeholder="Nome do elemento"
              aria-label="Nome do elemento"
              onChange={(evento) => setNome(evento.target.value)}
              onKeyDown={(evento) => {
                if (evento.key === 'Enter' && nome.trim()) salvar()
              }}
            />
            {/* O lápis do campo é do Figma e só devolve o foco para o texto. */}
            <button
              type="button"
              className={s.lapisDoCampo}
              onClick={() => campoRef.current?.focus()}
              aria-label="Editar o nome do elemento"
            >
              <Icon nome="Edit" />
            </button>
          </div>
          <p className={s.dica}>(Ex.: Horizontal, Cor)</p>
        </div>

        <div className={s.anexo}>
          <div className={s.grupoAnexo}>
            <Miniatura arquivo={anexo} />
            <span className={s.nomeDoArquivo}>{anexo?.nome}</span>
          </div>

          <div className={s.acoesDoAnexo}>
            <button
              type="button"
              className={s.acao}
              onClick={trocarArquivo}
              aria-label="Trocar o arquivo"
            >
              <Icon nome="Edit" />
            </button>
            <button
              type="button"
              className={`${s.acao} ${s.destrutiva}`}
              onClick={removerAnexo}
              aria-label="Remover o arquivo"
            >
              <Icon nome="Delete" />
            </button>
          </div>
        </div>

        <div className={s.rodape}>
          <button type="button" className={s.voltar} onClick={onFechar}>
            Voltar
          </button>
          <button
            type="button"
            className={s.continuar}
            onClick={salvar}
            disabled={!nome.trim() || !anexo}
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  )
}

/** Prévia real para imagem; ícone genérico para zip e afins. */
export function Miniatura({ arquivo, className }) {
  const [falhou, setFalhou] = useState(false)
  const ehImagem = /\.(png|svg|jpe?g)$/i.test(arquivo?.nome ?? '')

  return (
    <span className={className ? `${s.miniatura} ${className}` : s.miniatura}>
      {arquivo?.url && ehImagem && !falhou ? (
        <img src={arquivo.url} alt="" className={s.previa} onError={() => setFalhou(true)} />
      ) : (
        <Icon nome="File" tamanho={40} />
      )}
    </span>
  )
}
