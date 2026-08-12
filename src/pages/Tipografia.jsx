import PaginaDoTema from '../components/PaginaDoTema.jsx'
import useFonteDoGoogle from '../hooks/useFonteDoGoogle.js'
import useManual from '../hooks/useManual.js'
import {
  estiloDaPrevia,
  familiaCss,
  nomeDaVariante,
  paresDeVariantes,
  urlDoCss2,
} from '../lib/googleFonts.js'
import s from './Tipografia.module.css'

/*
 * Página de leitura da Tipografia — node 6179:4189 do Figma.
 *
 * Um bloco por fonte salva: o rótulo, o nome escrito na própria fonte em 160px
 * e a lista de pesos marcados, cada rótulo desenhado no peso e no estilo que
 * nomeia, com a itálica do mesmo peso ao lado.
 *
 * As fontes são carregadas do mesmo jeito que no passo — o embed público do
 * Google Fonts, pelo useFonteDoGoogle —, e só com os pesos que foram marcados.
 */
export default function Tipografia() {
  const { manual, carregando } = useManual()

  const primaria = manual?.tipografia?.primaria
  const secundarias = (manual?.tipografia?.secundarias ?? []).filter((vaga) => vaga.fonte)

  return (
    <PaginaDoTema
      titulo="Tipografia"
      slug="tipografia"
      carregando={carregando}
      temConteudo={Boolean(primaria)}
      vazio="Nada adicionado ainda. Escolha a tipografia da marca para vê-la aqui."
    >
      <Bloco rotulo="Tipografia da Marca" fonte={primaria} />

      {secundarias.map((vaga, indice) => (
        <Bloco
          key={vaga.id}
          // Numerar só faz sentido havendo mais de uma para distinguir.
          rotulo={
            secundarias.length > 1
              ? `Tipografia Secundária ${indice + 1}`
              : 'Tipografia Secundária'
          }
          fonte={vaga.fonte}
        />
      ))}
    </PaginaDoTema>
  )
}

function Bloco({ rotulo, fonte }) {
  // Um <link> por fonte, com os pesos marcados dela. O hook conta os usos, então
  // duas fontes iguais não duplicam o <link>.
  useFonteDoGoogle(urlDoCss2(fonte))

  if (!fonte) return null

  const familia = familiaCss(fonte)
  const pares = paresDeVariantes(fonte)

  return (
    <section className={s.bloco}>
      <h2 className={s.rotulo}>{rotulo}</h2>

      {/* O nome grande usa o peso marcado mais perto de 500, que é o do Figma;
          pedir um peso não carregado faria o navegador engrossar sozinho. */}
      <p className={s.nome} style={{ fontFamily: familia, ...estiloDaPrevia(fonte, 500) }}>
        {fonte.familia}
      </p>

      <div className={s.pesos}>
        {pares.map((par) => (
          <div key={par.peso} className={s.linha}>
            <Variante variante={par.romana} familia={familia} />
            <Variante variante={par.italica} familia={familia} />
          </div>
        ))}
      </div>
    </section>
  )
}

/**
 * Um rótulo de peso, escrito no peso e no estilo dele.
 *
 * Sem variante devolve a célula vazia, e não nada: é ela que segura a coluna no
 * lugar quando um peso não tem a itálica marcada.
 */
function Variante({ variante, familia }) {
  if (!variante) return <span aria-hidden="true" />

  return (
    <p
      className={s.variante}
      style={{
        fontFamily: familia,
        fontWeight: variante.peso,
        fontStyle: variante.italico ? 'italic' : 'normal',
      }}
    >
      {nomeDaVariante(variante)}
    </p>
  )
}
