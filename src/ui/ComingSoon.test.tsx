import { render, screen } from '@testing-library/react-native';
import ComingSoon from './ComingSoon';

describe('ComingSoon', () => {
  it('renderiza o título da seção e a mensagem "Em breve"', () => {
    render(<ComingSoon title="Documentos" />);
    expect(screen.getByText('Documentos')).toBeOnTheScreen();
    expect(screen.getByText('Em breve')).toBeOnTheScreen();
  });
});
