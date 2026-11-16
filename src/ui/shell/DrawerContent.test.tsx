import { fireEvent, render, screen } from '@testing-library/react-native';
import { Linking } from 'react-native';
import DrawerContent from './DrawerContent';
import { PRIVACIDADE_URL, TERMOS_URL } from '@/lib/config';

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: jest.fn(), push: jest.fn() }),
  useSegments: () => [],
}));
jest.mock('@/hooks/useSession', () => ({ useSession: () => ({ logout: jest.fn() }) }));
jest.mock('@/hooks/useMember', () => ({ useMember: () => ({ data: null }) }));

// A loja exige que a política de privacidade seja alcançável, e o app é onde o
// membro a procura. Se alguém remover estes itens, o requisito some sem aviso.
describe('DrawerContent — documentos legais', () => {
  it.each([
    ['drawer-privacidade', 'Política de Privacidade', () => PRIVACIDADE_URL],
    ['drawer-termos', 'Termos de Uso', () => TERMOS_URL],
  ])('%s abre a URL pública no navegador', (testID, rotulo, url) => {
    const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true as never);
    const onClose = jest.fn();

    render(<DrawerContent onClose={onClose} />);

    expect(screen.getByText(rotulo)).toBeOnTheScreen();
    fireEvent.press(screen.getByTestId(testID));

    expect(openURL).toHaveBeenCalledWith(url());
    expect(onClose).toHaveBeenCalled();
    openURL.mockRestore();
  });

  it('as URLs saem da mesma base da API, sem domínio escrito à mão', () => {
    expect(PRIVACIDADE_URL.endsWith('/privacidade')).toBe(true);
    expect(TERMOS_URL.endsWith('/termos')).toBe(true);
    expect(PRIVACIDADE_URL.replace('/privacidade', '')).toBe(TERMOS_URL.replace('/termos', ''));
  });
});
