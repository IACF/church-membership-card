import { render, screen } from '@testing-library/react-native';
import CopvasfLogo from './CopvasfLogo';

describe('CopvasfLogo', () => {
  it('renderiza a imagem do logo oficial (sem o emoji de livro)', () => {
    render(<CopvasfLogo />);
    expect(screen.getByTestId('copvasf-logo')).toBeOnTheScreen();
    expect(screen.queryByText('📖')).toBeNull();
  });
});
