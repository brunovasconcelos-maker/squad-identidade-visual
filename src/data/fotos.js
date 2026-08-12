/*
 * O acervo inteiro de fotos — as 54 imagens das seis categorias — e o brilho
 * medido de cada uma.
 *
 * O passo de Fotografia trabalha por categoria (ver data/fotografia.js); aqui a
 * lista é plana, porque quem escolhe a foto de fundo da página do Logo procura
 * no acervo todo, não só no que a pessoa selecionou.
 *
 * Os números vêm de scripts/gerar-luminancia.mjs, rodado à mão. Ver o cabeçalho
 * daquele arquivo para o porquê de não ser medido no navegador.
 */
import { CATEGORIAS, NUMEROS_DE_FOTO } from './fotografia.js'
import luminancias from './luminanciaDasFotos.json'

/** Nomes de arquivo (sem extensão) de todas as fotos, em ordem de categoria. */
export const TODAS_AS_FOTOS = CATEGORIAS.flatMap((categoria) =>
  NUMEROS_DE_FOTO.map((numero) => `${categoria.prefixo}-${numero}`),
)

/**
 * Luminância relativa média do miolo da foto, de 0 (preto) a 1 (branco), ou
 * undefined se o arquivo não tiver sido medido.
 */
export function luminanciaDaFoto(nome) {
  return luminancias[nome]
}
