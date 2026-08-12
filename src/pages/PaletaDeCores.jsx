import PaginaDoTema from '../components/PaginaDoTema.jsx'
import useManual from '../hooks/useManual.js'
import { niveisDeContraste } from '../lib/cor.js'
import s from './PaletaDeCores.module.css'

/*
 * Página de leitura da Paleta de Cores — node 6178:2788 do Figma.
 *
 * Uma seção por cor salva: o nome, a amostra da âncora ocupando a coluna
 * inteira, o rótulo dela e a fileira com a escala de tons. Cada amostra traz
 * os selos de contraste, que dizem em que nível do WCAG um texto branco ou
 * preto lê por cima dela.
 *
 * Tudo sai do que já foi salvo (useManual); não há modelo de dados novo.
 */
export default function PaletaDeCores() {
  const { manual, carregando } = useManual()
  const cores = manual?.paleta ?? []

  return (
    <PaginaDoTema
      titulo="Paleta de Cores"
      slug="paleta-de-cores"
      carregando={carregando}
      temConteudo={cores.length > 0}
      vazio="Nada adicionado ainda. Escolha as cores da marca para ver a paleta aqui."
    >
      {cores.map((cor) => (
        <Cor key={cor.id} cor={cor} />
      ))}
    </PaginaDoTema>
  )
}

function Cor({ cor }) {
  // A âncora é o hex que a pessoa escolheu; ela também aparece na fileira, no
  // degrau dela, e é assim no Figma.
  const ancora = cor.tons.find((tom) => tom.ancora)

  return (
    <section className={s.cor}>
      <h2 className={s.nome}>{cor.nome}</h2>

      {ancora && (
        <>
          <Amostra hex={ancora.hex} />
          <Rotulo passo={ancora.passo} hex={ancora.hex} />
        </>
      )}

      {/* Do escuro para o claro, como no Figma. `cor.tons` vem na ordem
          contrária (PASSOS_DE_TOM começa no 95), que é a que o passo de Paleta
          mostra — aqui a fileira é invertida só na exibição. */}
      <div className={s.tons}>
        {[...cor.tons].reverse().map((tom) => (
          <div key={tom.passo} className={s.tom}>
            <Amostra hex={tom.hex} />
            <Rotulo passo={tom.passo} hex={tom.hex} />
          </div>
        ))}
      </div>
    </section>
  )
}

function Amostra({ hex }) {
  const niveis = niveisDeContraste(hex)

  return (
    <div className={s.amostra} style={{ backgroundColor: `#${hex}` }}>
      {niveis.length > 0 && (
        <div className={s.selos}>
          {niveis.map(({ texto, nivel }) => (
            // A cor do selo é a do texto que passa, e o quadrado herda dela
            // pelo currentcolor.
            <span key={texto} className={s.selo} style={{ color: `#${texto}` }}>
              <span className={s.quadrado} />
              {nivel}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function Rotulo({ passo, hex }) {
  return (
    <div className={s.rotulo}>
      <span className={s.passo}>{passo}</span>
      <span className={s.hex}>#{hex}</span>
    </div>
  )
}
