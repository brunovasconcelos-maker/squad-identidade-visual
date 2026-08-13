import { useEffect, useRef, useState } from 'react'
import Icon from './Icon.jsx'
import { lerArquivo } from '../lib/manual.js'
import {
  ACCEPT,
  analisar,
  criarFontePropria,
  ehArquivoDeFonte,
  ehZip,
  extrairDoZip,
  familiaSugerida,
} from '../lib/fontesProprias.js'
import s from './ModalFontePropria.module.css'

/**
 * Envio de uma fonte própria, em duas telas: o upload e a conferência.
 *
 * Aceita arquivos soltos (vários de uma vez) e um .zip com as fontes dentro. O
 * peso de cada arquivo é lido de dentro dele; quando a leitura falha — WOFF2,
 * que o opentype.js não abre, ou arquivo corrompido — a linha ganha um campo
 * para a pessoa escrever o peso. Detecção que falha atrasa, não impede.
 *
 * Só devolve alguma coisa pelo `onSalvar`. Fechar pelo X, pelo "Voltar", pelo
 * Esc ou pelo fundo descarta tudo.
 */
export default function ModalFontePropria({ onSalvar, onFechar }) {
  // null enquanto ninguém enviou nada; depois, a lista da conferência.
  const [linhas, setLinhas] = useState(null)
  const [familia, setFamilia] = useState('')
  const [erro, setErro] = useState(null)
  const [lendo, setLendo] = useState(false)
  const [arrastando, setArrastando] = useState(false)
  const inputRef = useRef(null)
  const painelRef = useRef(null)
  // Os bytes ficam fora do estado: são grandes e não influenciam a renderização.
  const bytesPorId = useRef(new Map())

  useEffect(() => {
    const aoTeclar = (evento) => {
      if (evento.key === 'Escape') onFechar()
    }
    document.addEventListener('keydown', aoTeclar)
    return () => document.removeEventListener('keydown', aoTeclar)
  }, [onFechar])

  const receber = async (lista) => {
    const enviados = [...(lista ?? [])]
    if (enviados.length === 0) return

    setErro(null)
    setLendo(true)

    try {
      // Um zip vira os arquivos de dentro dele; os soltos passam direto.
      const arquivos = (
        await Promise.all(
          enviados.map(async (arquivo) => {
            if (ehZip(arquivo)) return extrairDoZip(arquivo)
            return ehArquivoDeFonte(arquivo.name) ? [arquivo] : []
          }),
        )
      ).flat()

      if (arquivos.length === 0) {
        setErro(
          enviados.some(ehZip)
            ? 'Nenhuma fonte encontrada no arquivo .zip. Envie um zip com arquivos TTF, OTF, WOFF ou WOFF2.'
            : 'Formato não aceito. Envie arquivos TTF, OTF, WOFF, WOFF2 ou um .zip com eles dentro.',
        )
        return
      }

      const analisadas = await analisar(arquivos)

      // Os bytes são lidos agora, e não ao salvar: se um arquivo falhar, falha
      // aqui, onde ainda dá para escolher outro.
      bytesPorId.current = new Map(
        await Promise.all(
          analisadas.map(async (linha) => [linha.id, await lerArquivo(linha.arquivo)]),
        ),
      )

      setLinhas(analisadas)
      setFamilia(familiaSugerida(analisadas, arquivos[0].name.replace(/\.[^.]+$/, '')))
    } catch (falha) {
      console.error('Não foi possível ler os arquivos de fonte.', falha)
      setErro('Não foi possível ler esses arquivos. Tente novamente ou envie outros.')
    } finally {
      setLendo(false)
    }
  }

  const mudarLinha = (id, mudanca) =>
    setLinhas((atual) =>
      atual.map((linha) => (linha.id === id ? { ...linha, ...mudanca } : linha)),
    )

  const escolhidas = linhas?.filter((linha) => linha.marcado) ?? []
  const pronto = Boolean(familia.trim()) && escolhidas.length > 0

  const salvar = () => onSalvar(criarFontePropria(familia, linhas, bytesPorId.current))

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
        aria-labelledby="titulo-modal-fonte"
      >
        <div className={s.cabecalho}>
          <h2 id="titulo-modal-fonte" className={s.titulo}>
            Adicionar minha font
          </h2>
          <button type="button" className={s.fechar} onClick={onFechar} aria-label="Fechar">
            <Icon nome="Close" />
          </button>
        </div>

        {linhas ? (
          <>
            <label className={s.campoFamilia}>
              <span className={s.rotuloDoCampo}>Nome da família</span>
              <input
                type="text"
                className={s.entrada}
                value={familia}
                onChange={(evento) => setFamilia(evento.target.value)}
              />
            </label>

            <div className={s.pesos}>
              <p className={s.rotuloDoCampo}>
                {linhas.length === 1 ? '1 arquivo enviado' : `${linhas.length} arquivos enviados`}
              </p>

              <ul className={s.listaDePesos}>
                {linhas.map((linha) => (
                  <li key={linha.id} className={s.peso}>
                    <label className={s.marcador}>
                      <input
                        type="checkbox"
                        className={s.caixaNativa}
                        checked={linha.marcado}
                        onChange={() => mudarLinha(linha.id, { marcado: !linha.marcado })}
                      />
                      <Icon nome={linha.marcado ? 'Check' : 'Check-Empt'} />
                      <span className={s.nomeDoArquivo}>{linha.arquivo.name}</span>
                    </label>

                    {/* Detectado, o peso é só rótulo; não detectado, é campo —
                        é a única diferença entre as duas linhas. */}
                    {linha.detectado ? (
                      <span className={s.rotuloDoPeso}>{linha.rotulo}</span>
                    ) : (
                      <input
                        type="text"
                        className={`${s.entrada} ${s.entradaDoPeso}`}
                        value={linha.rotulo}
                        placeholder="Ex.: Bold"
                        aria-label={`Peso de ${linha.arquivo.name}`}
                        onChange={(evento) =>
                          mudarLinha(linha.id, { rotulo: evento.target.value })
                        }
                      />
                    )}
                  </li>
                ))}
              </ul>

              {linhas.some((linha) => !linha.detectado) && (
                <p className={s.aviso}>
                  Não foi possível ler o peso de todos os arquivos. Escreva o peso dos que ficaram
                  em branco (ex.: Regular, Bold, Bold Italic).
                </p>
              )}
            </div>
          </>
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
              receber(evento.dataTransfer.files)
            }}
          >
            <button
              type="button"
              className={s.alvo}
              onClick={() => inputRef.current?.click()}
              disabled={lendo}
            >
              <Icon nome="File-Upload" tamanho={40} />
              <span className={s.instrucao}>
                {lendo ? (
                  'Lendo os arquivos...'
                ) : (
                  <>
                    Faça upload ou arraste os arquivos da fonte
                    <br />
                    TTF, OTF, WOFF, WOFF2 ou um .zip com eles dentro.
                  </>
                )}
              </span>
            </button>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPT}
          className={s.input}
          onChange={(evento) => {
            receber(evento.target.files)
            // Permite reenviar o mesmo arquivo logo em seguida.
            evento.target.value = ''
          }}
        />

        {erro && (
          <p className={s.erro} role="alert">
            {erro}
          </p>
        )}

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
