import { render, screen } from '@testing-library/react-native';
import { AxiosError } from 'axios';
import CarteirinhaScreen from '../../../app/(app)/index';
import { useMember } from '@/hooks/useMember';
import { memberFixture } from '@/model/member.fixture';

jest.mock('@/hooks/useMember');
// O botão de exportar puxa expo-print/sharing/file-system via exportCard — mockado
// aqui para o teste da tela não depender de módulos nativos.
jest.mock('@/lib/pdf/exportCard', () => ({ exportCardPdf: jest.fn() }));

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
    expect(screen.getByText('Sem conexão com a internet.')).toBeOnTheScreen();
  });

  it('com membro → oferece "Exportar PDF"', () => {
    (useMember as jest.Mock).mockReturnValue({
      data: memberFixture,
      isPending: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<CarteirinhaScreen />);
    expect(screen.getByTestId('export-pdf')).toBeOnTheScreen();
  });

  it('sem membro (carregando) → não mostra "Exportar PDF"', () => {
    (useMember as jest.Mock).mockReturnValue({
      data: undefined,
      isPending: true,
      error: null,
      refetch: jest.fn(),
    });

    render(<CarteirinhaScreen />);
    expect(screen.queryByTestId('export-pdf')).toBeNull();
  });
});
