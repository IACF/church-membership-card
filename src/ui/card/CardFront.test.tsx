import { render, screen } from '@testing-library/react-native';
import CardFront from './CardFront';
import { memberFixture } from '@/model/member.fixture';

describe('CardFront', () => {
  it('exibe nome, função+cargo na mesma linha, registro e igreja do membro', () => {
    render(<CardFront member={memberFixture} />);

    expect(screen.getByText('Lucas de Souza Conceição')).toBeOnTheScreen();
    // Função e Cargo compartilham a mesma linha (um único texto).
    expect(
      screen.getByText('Pastor - Presidente do Conselho de Pastores do Vale do São Francisco'),
    ).toBeOnTheScreen();
    expect(screen.getByText('2024003')).toBeOnTheScreen();
    expect(screen.getByText('Assembleia de Deus Ministério Logos')).toBeOnTheScreen();
  });

  it('sem cargo, exibe apenas a função na linha Função/Cargo', () => {
    render(<CardFront member={{ ...memberFixture, cargo: undefined }} />);
    expect(screen.getByText('Pastor')).toBeOnTheScreen();
  });

  it('exibe o CNPJ do conselho no rodapé frontal', () => {
    render(<CardFront member={memberFixture} />);
    expect(screen.getByTestId('cnpj')).toHaveTextContent('CNPJ: 66.551.138/0001-97');
  });

  it('exibe o brasão da República (imagem) e não o emoji de bandeira', () => {
    render(<CardFront member={memberFixture} />);
    expect(screen.getByTestId('brasao')).toBeOnTheScreen();
    expect(screen.queryByText('🇧🇷')).toBeNull();
  });
});
