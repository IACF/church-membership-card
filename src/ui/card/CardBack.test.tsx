import { render, screen } from '@testing-library/react-native';
import CardBack from './CardBack';
import { memberFixture } from '@/model/member.fixture';

describe('CardBack', () => {
  it('exibe CPF e nascimento formatados e as assinaturas do conselho', () => {
    render(<CardBack member={memberFixture} />);

    // cpf em dígitos no fixture → formatado na exibição
    expect(screen.getByText('058.178.655-64')).toBeOnTheScreen();
    // nascimento YYYY-MM-DD → dd/mm/aaaa
    expect(screen.getByText('19/07/1993')).toBeOnTheScreen();
    expect(screen.getByText('José Humberto S. Santos')).toBeOnTheScreen();
    expect(screen.getByText('Presidente do COPVASF')).toBeOnTheScreen();
  });
});
