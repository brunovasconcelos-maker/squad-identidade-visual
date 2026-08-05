import UploadArquivo from '../components/UploadArquivo.jsx'
import s from './PassoArquivos.module.css'

/**
 * Estrutura comum aos passos de upload: a moldura principal em cima e as duas
 * variações de cor única lado a lado. Logo e Ícone só mudam a cópia; o que for
 * exclusivo de um passo entra como `children`, abaixo das molduras.
 */
export default function PassoArquivos({ titulos, instrucao, arquivos, onSalvar, children }) {
  return (
    <div className={s.passo}>
      <UploadArquivo
        titulo={titulos.principal}
        instrucao={instrucao}
        arquivo={arquivos.principal}
        onArquivo={(arquivo) => onSalvar('principal', arquivo)}
      />

      <div className={s.par}>
        <UploadArquivo
          titulo={titulos.preta}
          instrucao={instrucao}
          arquivo={arquivos.preta}
          fundo="branco"
          onArquivo={(arquivo) => onSalvar('preta', arquivo)}
        />
        <UploadArquivo
          titulo={titulos.branca}
          instrucao={instrucao}
          arquivo={arquivos.branca}
          fundo="preto"
          onArquivo={(arquivo) => onSalvar('branca', arquivo)}
        />
      </div>

      {children}
    </div>
  )
}
