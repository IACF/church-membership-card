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

  it('filiação lista pai e mãe (nomes separados, empilhados)', () => {
    render(<CardBack member={memberFixture} />);
    expect(screen.getByText('Raimundo Marques da Conceição')).toBeOnTheScreen();
    expect(screen.getByText('Maria Janete de Souza Conceição')).toBeOnTheScreen();
  });

  it('sem nome do pai, exibe apenas o nome da mãe', () => {
    render(<CardBack member={{ ...memberFixture, nomePai: undefined }} />);
    expect(screen.queryByText('Raimundo Marques da Conceição')).not.toBeOnTheScreen();
    expect(screen.getByText('Maria Janete de Souza Conceição')).toBeOnTheScreen();
  });
});
