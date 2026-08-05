/*
 * Dados de exemplo do passo de Paleta de Cores.
 *
 * É mock: nada aqui vem de escolha real do usuário nem de cálculo de tom ou
 * de contraste. Serve só para montar o estado preenchido enquanto a lógica de
 * cor não existe. Os valores são os do Figma.
 */
export const CONTRASTE_EXEMPLO = 'AAA'

export const corDeExemplo = {
  nome: 'Roxo Inner',
  hex: 'B885FC',
  contraste: CONTRASTE_EXEMPLO,
  tons: [
    { hex: 'F1E6FE', pontoClaro: false },
    { hex: 'D4B4FD', pontoClaro: false },
    { hex: 'B885FC', pontoClaro: false },
    { hex: '7D1FF9', pontoClaro: true },
    { hex: '4D04AE', pontoClaro: true },
    { hex: '21024B', pontoClaro: true },
  ],
}

// Estado estático do color picker, igual ao do Figma.
export const pickerDeExemplo = {
  corBase: '#b885fc',
  hex: '#E89623',
  r: 232,
  g: 150,
  b: 35,
}
