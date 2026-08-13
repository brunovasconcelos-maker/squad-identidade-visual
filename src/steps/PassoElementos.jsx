import { useRef, useState } from 'react'
import CartaoDeElemento, { AcaoDoCartao } from '../components/CartaoDeElemento.jsx'
import Icon from '../components/Icon.jsx'
import ModalElemento from '../components/ModalElemento.jsx'
import { MAXIMO_DE_ELEMENTOS } from '../hooks/useFluxo.js'
import s from './PassoElementos.module.css'

const ACCEPT = '.png,.svg,.jpg,.jpeg,.zip'
const VALIDO = /\.(png|svg|jpe?g|zip)$/i

/**
 * Passo de Elementos: a moldura de upload continua ativa enquanto couber mais
 * elemento, e cada arquivo aceito abre o modal para receber um nome.
 *
 * O arquivo escolhido só vira elemento quando o modal é salvo — fechar sem
 * salvar descarta a tentativa e deixa a lista como estava.
 */
export default function PassoElementos({ elementos, acoes }) {
  const inputRef = useRef(null)
  const escolhaPendente = useRef(null)
  const [arrastando, setArrastando] = useState(false)
  const [erro, setErro] = useState(null)
  // { arquivo } para um elemento novo, { elemento } para edição.
  const [modal, setModal] = useState(null)

  const noLimite = elementos.length >= MAXIMO_DE_ELEMENTOS

  const abrirSeletor = () => {
    inputRef.current?.click()
  }

  // Devolve o arquivo escolhido para quem pediu (o lápis do modal), ou null se
  // a pessoa fechar o seletor sem escolher nada.
  const pedirArquivo = () =>
    new Promise((resolve) => {
      escolhaPendente.current = resolve
      abrirSeletor()
    })

  const receber = (arquivo) => {
    // Um seletor aberto pelo modal tem dono; o resto abre um elemento novo.
    const pendente = escolhaPendente.current
    escolhaPendente.current = null

    if (!arquivo) {
      pendente?.(null)
      return
    }

    if (!VALIDO.test(arquivo.name)) {
      setErro('Formato não aceito. Envie um arquivo PNG, SVG, JPG ou ZIP.')
      pendente?.(null)
      return
    }

    setErro(null)
    if (pendente) pendente(arquivo)
    else setModal({ arquivo })
  }

  const salvarDoModal = (nome, arquivoNovo) => {
    if (modal.elemento) acoes.atualizar(modal.elemento.id, nome, arquivoNovo)
    else acoes.adicionar(nome, arquivoNovo ?? modal.arquivo)
    setModal(null)
  }

  return (
    <div className={s.passo}>
      <h2 className={s.titulo}>Elementos adicionais</h2>

      {noLimite ? (
        <p className={s.limite}>
          Você chegou ao máximo de {MAXIMO_DE_ELEMENTOS} elementos. Exclua um para adicionar
          outro.
        </p>
      ) : (
        <div
          className={arrastando ? `${s.moldura} ${s.arrastando}` : s.moldura}
          onDragOver={(evento) => {
            evento.preventDefault()
            setArrastando(true)
          }}
          onDragLeave={() => setArrastando(false)}
          onDrop={(evento) => {
            evento.preventDefault()
            setArrastando(false)
            receber(evento.dataTransfer.files?.[0])
          }}
        >
          <button
            type="button"
            className={s.alvo}
            onClick={abrirSeletor}
            aria-label="Enviar um elemento"
          >
            <Icon nome="File-Upload" tamanho={40} />
            <span className={s.instrucao}>
              Faça upload ou arraste a arquivos adicionais.
              <br />
              Você pode adicionar arquivos PNG, SVG, JPG e ZIPS.
            </span>
          </button>
        </div>
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

      {erro && (
        <p className={s.erro} role="alert">
          {erro}
        </p>
      )}

      {elementos.length > 0 && (
        <>
          <h2 className={s.tituloAdicionados}>Adicionados</h2>
          <ul className={s.lista}>
            {elementos.map((elemento) => (
              <CartaoDeElemento key={elemento.id} elemento={elemento}>
                <AcaoDoCartao
                  type="button"
                  onClick={() => setModal({ elemento })}
                  aria-label={`Editar ${elemento.nome}`}
                >
                  <Icon nome="Edit" />
                </AcaoDoCartao>
                <AcaoDoCartao
                  type="button"
                  destrutiva
                  onClick={() => acoes.remover(elemento.id)}
                  aria-label={`Excluir ${elemento.nome}`}
                >
                  <Icon nome="Delete" />
                </AcaoDoCartao>
              </CartaoDeElemento>
            ))}
          </ul>
        </>
      )}

      {modal && (
        <ModalElemento
          elemento={modal.elemento}
          arquivoInicial={modal.arquivo}
          onSalvar={salvarDoModal}
          onFechar={() => setModal(null)}
          onEscolherArquivo={pedirArquivo}
        />
      )}
    </div>
  )
}
