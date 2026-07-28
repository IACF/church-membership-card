import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import * as expoRouter from 'expo-router';
import VoluntaryChangePassword from '../../../app/(app)/change-password';
import * as authApi from '@/api/auth.api';

jest.mock('expo-router', () => ({ useRouter: jest.fn() }));
jest.mock('@/api/auth.api');

const back = jest.fn();
const mockedChange = authApi.changePassword as jest.MockedFunction<
  typeof authApi.changePassword
>;

function renderScreen() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <VoluntaryChangePassword />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  (expoRouter.useRouter as jest.Mock).mockReturnValue({ back });
});

describe('Troca voluntária de senha (Perfil)', () => {
  it('sucesso mostra confirmação e permite voltar ao perfil', async () => {
    mockedChange.mockResolvedValue(undefined);
    renderScreen();

    fireEvent.changeText(screen.getByTestId('currentPassword'), '52998');
    fireEvent.changeText(screen.getByTestId('newPassword'), 'nova-senha-1');
    fireEvent.changeText(screen.getByTestId('confirmNewPassword'), 'nova-senha-1');
    fireEvent.press(screen.getByTestId('submit'));

    await waitFor(() =>
      expect(screen.getByTestId('change-success')).toBeOnTheScreen(),
    );
    expect(mockedChange).toHaveBeenCalledWith('52998', 'nova-senha-1');

    fireEvent.press(screen.getByTestId('back'));
    expect(back).toHaveBeenCalled();
  });
});
