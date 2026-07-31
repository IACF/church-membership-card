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

// Fator de escala do cartão a partir das dimensões da janela. Guiado pela LARGURA
// disponível (mantém a proporção 340:215), com um teto pela altura da janela e por
// MAX_SCALE. A tela da carteirinha ROLA na vertical (ScrollView), então em paisagem
// o cartão cresce usando a largura ampla em vez de encolher pela altura curta —
// e nada é cortado quando ele passa da área visível. Telas pequenas → < 1 (reduz).
// Puro/determinístico para ser testado sem renderizar.
export function computeCardScale(windowWidth: number, windowHeight: number): number {
  const byWidth = Math.max(windowWidth - HORIZONTAL_MARGIN, 1) / CARD_W;
  const byHeight = Math.max(windowHeight, 1) / CARD_H;
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
