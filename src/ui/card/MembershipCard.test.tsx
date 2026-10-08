import { render, screen } from '@testing-library/react-native';
import MembershipCard from './MembershipCard';
import { memberFixture } from '@/model/member.fixture';
import {
  computeCardScale,
  fitCargoFontSize,
  CARGO_BASE_FONT,
  CARD_CHROME_PORTRAIT,
  CARD_CHROME_LANDSCAPE,
  CARD_W,
  CARD_H,
  ASPECT,
} from './cardBase';

// `computeCardScale` passou a receber a ÁREA DISPONÍVEL (medida por onLayout),
// não as dimensões da janela — ver spec `carteirinha-paisagem`. Os cenários abaixo
// passam a área já descontada da trilha/cabeçalho, como a tela faz em runtime.
describe('computeCardScale (responsividade)', () => {
  it('reduz (< 1) em telas pequenas para caber', () => {
    // iPhone SE (1ª geração), retrato: 320×568.
    expect(computeCardScale(320, 568)).toBeLessThan(1);
  });

  it('satura no teto (MAX_SCALE) em telas grandes', () => {
    const big = computeCardScale(1200, 1600);
    const bigger = computeCardScale(2000, 2600);
    expect(big).toBe(bigger); // ambos limitados pelo mesmo teto
    expect(big).toBeGreaterThan(1);
  });

  it('é MAIOR em paisagem do que em retrato (mesmo aparelho)', () => {
    const portrait = computeCardScale(390, 844);
    const landscape = computeCardScale(844, 390);
    expect(landscape).toBeGreaterThan(portrait);
  });

  it('mantém a proporção 340:215 (a caixa renderizada é CARD_W*s × CARD_H*s)', () => {
    const s = computeCardScale(390, 844);
    expect((CARD_W * s) / (CARD_H * s)).toBeCloseTo(ASPECT);
  });
});

// O critério central da spec `carteirinha-paisagem` (AC1.1): em paisagem a
// carteirinha cabe INTEIRA na área visível, sem rolagem. Antes esta função usava
// a altura da JANELA como teto e ignorava cabeçalho, dica e botão de exportar —
// o cálculo dizia que cabia e a tela rolava.
describe('computeCardScale — cabe sem rolagem em paisagem', () => {
  // iPhone 14 deitado (844×390), menos a trilha vertical de 56px.
  const LARGURA = 844 - 56;
  const ALTURA = 390;

  it('o cartão e seu respiro cabem na altura disponível', () => {
    const s = computeCardScale(LARGURA, ALTURA, true);
    expect(CARD_H * s + CARD_CHROME_LANDSCAPE).toBeLessThanOrEqual(ALTURA);
  });

  it('o cartão cabe na largura disponível', () => {
    const s = computeCardScale(LARGURA, ALTURA, true);
    expect(CARD_W * s).toBeLessThanOrEqual(LARGURA);
  });

  it('cabe também num aparelho pequeno deitado (640×360)', () => {
    const l = 640 - 56;
    const a = 360;
    const s = computeCardScale(l, a, true);
    expect(CARD_H * s + CARD_CHROME_LANDSCAPE).toBeLessThanOrEqual(a);
    expect(CARD_W * s).toBeLessThanOrEqual(l);
  });

  it('a proporção segue intacta em paisagem', () => {
    const s = computeCardScale(LARGURA, ALTURA, true);
    expect((CARD_W * s) / (CARD_H * s)).toBeCloseTo(ASPECT);
  });
});

// Deitado, a altura é o recurso escasso. Tirar a dica e o botão de baixo do
// cartão (selo sobreposto + exportar na trilha) é o que permite o cartão crescer.
// Sem estes testes, alguém poderia devolver o chrome ao eixo vertical sem notar
// que encolheu a carteirinha em um terço.
describe('aproveitamento da altura em paisagem', () => {
  const LARGURA = 844 - 56;
  const ALTURA = 390;

  it('ocupa ao menos 90% da altura disponível', () => {
    const s = computeCardScale(LARGURA, ALTURA, true);
    expect((CARD_H * s) / ALTURA).toBeGreaterThan(0.9);
  });

  it('é bem maior do que seria com o chrome de retrato', () => {
    const deitado = computeCardScale(LARGURA, ALTURA, true);
    const comChromeDeRetrato = computeCardScale(LARGURA, ALTURA, false);
    expect(deitado).toBeGreaterThan(comChromeDeRetrato * 1.25);
  });

  it('o chrome de paisagem é bem menor que o de retrato', () => {
    expect(CARD_CHROME_LANDSCAPE).toBeLessThan(CARD_CHROME_PORTRAIT / 3);
  });

  it('não excede a altura (o limite é caber, não encostar)', () => {
    const s = computeCardScale(LARGURA, ALTURA, true);
    expect(CARD_H * s).toBeLessThan(ALTURA);
  });
});

describe('fitCargoFontSize (Função/Cargo, máx. 2 linhas)', () => {
  it('mantém a fonte-base quando o texto cabe em 2 linhas', () => {
    expect(fitCargoFontSize('Pastor - Presidente do Conselho')).toBe(CARGO_BASE_FONT);
  });

  it('reduz a fonte quando o texto passaria de 2 linhas', () => {
    const longo =
      'Pastor - Presidente do Conselho de Pastores do Vale do São Francisco e Coordenador Regional';
    expect(fitCargoFontSize(longo)).toBeLessThan(CARGO_BASE_FONT);
  });

  it('nunca reduz abaixo de um mínimo legível', () => {
    const enorme = 'Pastor - '.padEnd(500, 'x');
    expect(fitCargoFontSize(enorme)).toBeGreaterThanOrEqual(7.5);
  });
});

describe('MembershipCard', () => {
  it('renderiza a frente da carteirinha e a dica de virar', () => {
    render(<MembershipCard member={memberFixture} />);

    expect(screen.getByText('CONSELHO DE PASTORES')).toBeOnTheScreen();
    expect(screen.getByText(/Toque para virar/)).toBeOnTheScreen();
  });

  it('membro em dia (inadimplente false) não exibe a tarja', () => {
    render(<MembershipCard member={memberFixture} />);
    expect(screen.queryByText('INADIMPLENTE')).toBeNull();
  });

  it('membro inadimplente exibe a tarja sobre a carteirinha', () => {
    render(<MembershipCard member={{ ...memberFixture, inadimplente: true }} />);
    expect(screen.getByText('INADIMPLENTE')).toBeOnTheScreen();
  });
});
