import { render, screen } from '@testing-library/react-native';
import CardFront from './CardFront';
import { memberFixture } from '@/model/member.fixture';

describe('CardFront', () => {
  it('exibe o nome completo, função, registro e igreja do membro', () => {
    render(<CardFront member={memberFixture} />);

    expect(screen.getByText('Lucas de Souza Conceição')).toBeOnTheScreen();
    expect(screen.getByText('Pastor')).toBeOnTheScreen();
    expect(screen.getByText('2024003')).toBeOnTheScreen();
    expect(
      screen.getByText('Assembleia de Deus Ministério Logos'),
    ).toBeOnTheScreen();
  });
});
