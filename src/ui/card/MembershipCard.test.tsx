import { render, screen } from '@testing-library/react-native';
import MembershipCard from './MembershipCard';
import { memberFixture } from '@/model/member.fixture';

describe('MembershipCard', () => {
  it('renderiza a frente da carteirinha e a dica de virar', () => {
    render(<MembershipCard member={memberFixture} />);

    expect(screen.getByText('CONSELHO DE PASTORES')).toBeOnTheScreen();
    expect(screen.getByText(/Toque para virar/)).toBeOnTheScreen();
  });
});
