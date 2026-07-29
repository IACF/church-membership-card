import { fireEvent, render, screen } from '@testing-library/react-native';
import * as expoRouter from 'expo-router';
import DrawerContent from './DrawerContent';
import { useMember } from '@/hooks/useMember';
import { useSession } from '@/hooks/useSession';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useSegments: jest.fn(),
}));
jest.mock('@/hooks/useMember');
jest.mock('@/hooks/useSession');

const push = jest.fn();
const replace = jest.fn();
const logout = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (expoRouter.useRouter as jest.Mock).mockReturnValue({ push, replace });
  (expoRouter.useSegments as jest.Mock).mockReturnValue(['(app)']);
  (useMember as jest.Mock).mockReturnValue({
    data: { nomeCompleto: 'Fulano Teste', registro: 'REG-1' },
  });
  (useSession as jest.Mock).mockReturnValue({ logout });
});

describe('DrawerContent', () => {
  it('mostra o nome completo e o registro do membro', () => {
    render(<DrawerContent onClose={jest.fn()} />);
    expect(screen.getByText('Fulano Teste')).toBeOnTheScreen();
    expect(screen.getByText('Registro: REG-1')).toBeOnTheScreen();
  });

  it('Meu Perfil navega e fecha o drawer', () => {
    const onClose = jest.fn();
    render(<DrawerContent onClose={onClose} />);
    fireEvent.press(screen.getByTestId('drawer-profile'));
    expect(push).toHaveBeenCalledWith('/(app)/profile');
    expect(onClose).toHaveBeenCalled();
  });

  it('Informações do conselho e Documentos navegam para as páginas "Em breve"', () => {
    render(<DrawerContent onClose={jest.fn()} />);
    fireEvent.press(screen.getByTestId('drawer-info'));
    expect(push).toHaveBeenCalledWith('/(app)/informacoes-conselho');
    fireEvent.press(screen.getByTestId('drawer-docs'));
    expect(push).toHaveBeenCalledWith('/(app)/documentos');
  });

  it('Sair chama logout', () => {
    render(<DrawerContent onClose={jest.fn()} />);
    fireEvent.press(screen.getByTestId('drawer-logout'));
    expect(logout).toHaveBeenCalled();
  });
});
