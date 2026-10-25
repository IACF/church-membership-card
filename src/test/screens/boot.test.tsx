import { render, screen } from '@testing-library/react-native';
import RootLayout from '../../../app/_layout';
import { useSession } from '@/hooks/useSession';

jest.mock('@/hooks/useSession');
jest.mock('expo-router', () => ({
  Stack: () => null,
  useRouter: () => ({ replace: jest.fn() }),
  useSegments: () => [],
}));

// A abertura tem DUAS camadas: a splash nativa mostra só o livro (desde o
// Android 12 ela é renderizada dentro de uma máscara circular e texto seria
// cortado), e esta tela de boot mostra o lockup completo, onde há espaço.
// Se alguém remover a marca daqui, a identidade some da abertura sem aviso.
describe('abertura do app', () => {
  it('exibe a marca enquanto a sessão é restaurada', () => {
    (useSession as unknown as jest.Mock).mockReturnValue({
      hydrate: jest.fn(),
      hydrated: false,
      isAuthenticated: false,
      mustChangePassword: false,
    });

    render(<RootLayout />);

    expect(screen.getByTestId('marca-boot')).toBeOnTheScreen();
  });

  it('some com a marca depois que a sessão carrega', () => {
    (useSession as unknown as jest.Mock).mockReturnValue({
      hydrate: jest.fn(),
      hydrated: true,
      isAuthenticated: false,
      mustChangePassword: false,
    });

    render(<RootLayout />);

    expect(screen.queryByTestId('marca-boot')).toBeNull();
  });
});
