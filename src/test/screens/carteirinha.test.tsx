import { render, screen } from '@testing-library/react-native';
import { AxiosError } from 'axios';
import CarteirinhaScreen from '../../../app/(app)/index';
import { useMember } from '@/hooks/useMember';
import { memberFixture } from '@/model/member.fixture';

jest.mock('@/hooks/useMember');

beforeEach(() => jest.clearAllMocks());

describe('CarteirinhaScreen (resiliência)', () => {
  it('mostra a carteirinha do cache mesmo com erro de refetch (offline)', () => {
    (useMember as jest.Mock).mockReturnValue({
      data: memberFixture,
      isPending: false,
      error: new AxiosError('offline', 'ERR_NETWORK'),
      refetch: jest.fn(),
    });

    render(<CarteirinhaScreen />);
    // dado do cache renderiza o card (título único da frente)
    expect(screen.getByText('CONSELHO DE PASTORES')).toBeOnTheScreen();
  });

  it('sem cache e offline → mensagem "sem conexão"', () => {
    (useMember as jest.Mock).mockReturnValue({
      data: undefined,
      isPending: false,
      error: new AxiosError('offline', 'ERR_NETWORK'),
      refetch: jest.fn(),
    });

    render(<CarteirinhaScreen />);
    expect(
      screen.getByText('Sem conexão com a internet.'),
    ).toBeOnTheScreen();
  });
});
