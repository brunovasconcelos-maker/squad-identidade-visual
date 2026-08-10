import PassoArquivos from './PassoArquivos.jsx'

const TITULOS = {
  principal: 'Ícone principal',
  preta: 'Ícone cor única (preta)',
  branca: 'Ícone cor única (branca)',
}

// Mesma estrutura do passo de Logo, sem a linha de "Outras variações".
export default function PassoIcone({ arquivos, onSalvar, onRemover }) {
  return (
    <PassoArquivos
      titulos={TITULOS}
      instrucao="Faça upload ou arraste o ícone pra cá"
      arquivos={arquivos}
      onSalvar={onSalvar}
      onRemover={onRemover}
    />
  )
}
