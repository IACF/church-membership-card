import { render, screen } from '@testing-library/react-native';
import DelinquencyBanner from './DelinquencyBanner';

describe('DelinquencyBanner', () => {
  it('exibe o texto de inadimplência', () => {
    render(<DelinquencyBanner />);
    expect(screen.getByText('INADIMPLENTE')).toBeOnTheScreen();
  });

  it('aceita um label customizado', () => {
    render(<DelinquencyBanner label="PENDÊNCIA" />);
    expect(screen.getByText('PENDÊNCIA')).toBeOnTheScreen();
  });
});
