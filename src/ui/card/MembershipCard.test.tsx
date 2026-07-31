import { render, screen } from '@testing-library/react-native';
import MembershipCard from './MembershipCard';
import { memberFixture } from '@/model/member.fixture';
import {
  computeCardScale,
  fitCargoFontSize,
  CARGO_BASE_FONT,
  CARD_W,
  CARD_H,
  ASPECT,
} from './cardBase';

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
