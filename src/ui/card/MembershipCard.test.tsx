import { render, screen } from '@testing-library/react-native';
import MembershipCard from './MembershipCard';
import { memberFixture } from '@/model/member.fixture';

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
