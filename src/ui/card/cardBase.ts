// Dimensões-base da carteirinha. Todo o layout interno (faixa, foto, campos,
// assinaturas, tarja) é posicionado em px sobre esta caixa 340×215; a
// responsividade (spec `carteirinha-responsiva`) escala a caixa inteira por um
// fator único, preservando o design sem reescrever coordenadas.
export const CARD_W = 340;
export const CARD_H = 215;
export const ASPECT = CARD_W / CARD_H; // proporção inviolável (~1.581)

const HORIZONTAL_MARGIN = 24;
// Teto para telas grandes (tablets), evitando um cartão desproporcionalmente enorme.
const MAX_SCALE = 1.8;

// Altura ocupada por tudo que divide a área de conteúdo com o cartão. Constante
// porque são textos de tamanho fixo; medi-los exigiria um segundo onLayout e um
// ciclo extra de layout, sem ganho.
//
// Os valores espelham os estilos reais — somá-los às cegas foi o que me fez errar
// antes: eu havia esquecido o paddingVertical do container, e o cartão vazava
// 55px para fora da tela em paisagem.
const HINT_H = 14 + 18; // marginTop + linha de "↻ Toque para virar"
const EXPORT_H = 16 + 15; // spacing.md + linha de "Exportar PDF"
const CONTENT_PADDING_V = 24 * 2; // spacing.lg em cima e embaixo (styles.center)

// RETRATO: dica e botão empilhados abaixo do cartão. Há altura de sobra.
export const CARD_CHROME_PORTRAIT = HINT_H + EXPORT_H + CONTENT_PADDING_V;

// PAISAGEM: nada divide a altura com o cartão. A altura é o recurso ESCASSO
// (o cartão usava 72% dela enquanto 45% da largura ficava vazia), então a dica
// vira um selo sobreposto no canto do cartão e o "Exportar PDF" migra para a
// trilha vertical — ambos passam a consumir largura, que sobra. Restam apenas
// 8px de respiro em cima e embaixo, para o cartão não encostar nas bordas.
// Resultado: o cartão cresce ~34% e passa a ocupar ~96% da altura.
export const CARD_CHROME_LANDSCAPE = 8 * 2;

export function cardChrome(isLandscape: boolean): number {
  return isLandscape ? CARD_CHROME_LANDSCAPE : CARD_CHROME_PORTRAIT;
}

// Fator de escala do cartão a partir da ÁREA DISPONÍVEL — não da janela.
//
// Antes esta função recebia as dimensões da janela e usava a altura cheia como
// teto. Só que o cartão vive numa área bem menor: descontados cabeçalho, dica,
// botão de exportar e área segura, sobram ~60% da altura num celular em paisagem.
// O cálculo "achava" que cabia e a tela rolava — ver spec `carteirinha-paisagem`.
//
// Agora recebe a área de conteúdo já medida (onLayout) e desconta o espaço da
// dica/botão, então o resultado CABE de fato. Em retrato a folga vertical é
// grande e a largura continua mandando, como antes.
// Pura/determinística para ser testada sem renderizar.
export function computeCardScale(
  availableWidth: number,
  availableHeight: number,
  isLandscape = false,
): number {
  const byWidth = Math.max(availableWidth - HORIZONTAL_MARGIN, 1) / CARD_W;
  const byHeight = Math.max(availableHeight - cardChrome(isLandscape), 1) / CARD_H;
  return Math.min(byWidth, byHeight, MAX_SCALE);
}

// Tamanho da fonte da linha Função/Cargo. A coluna comporta ~CARGO_CHARS_2_LINES
// caracteres em 2 linhas na fonte-base. Enquanto o texto couber em 2 linhas, usa
// a fonte-base; passando disso, REDUZ proporcionalmente para caber no mesmo
// espaço de 2 linhas normais (limite máximo 2 linhas), até um mínimo legível.
// O `adjustsFontSizeToFit` no componente afina no device; esta função dá o
// tamanho determinístico (também vale no preview web, onde aquele prop é no-op).
export const CARGO_BASE_FONT = 13;
const CARGO_MIN_FONT = 7.5;
const CARGO_CHARS_2_LINES = 44;

export function fitCargoFontSize(text: string): number {
  const len = text.length;
  if (len <= CARGO_CHARS_2_LINES) return CARGO_BASE_FONT;
  const scaled = CARGO_BASE_FONT * (CARGO_CHARS_2_LINES / len);
  return Math.max(CARGO_MIN_FONT, Math.round(scaled * 10) / 10);
}
