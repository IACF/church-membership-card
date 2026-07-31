import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import ChangePasswordScreen from '../../../app/(auth)/change-password';
import * as authApi from '@/api/auth.api';
import { useSessionStore } from '@/session/session.store';

jest.mock('@/api/auth.api');
const mockedChange = authApi.changePassword as jest.MockedFunction<typeof authApi.changePassword>;

function renderScreen() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <ChangePasswordScreen />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  useSessionStore.setState({
    token: 't',
    member: { id: 'm', nomeCompleto: 'Nome', registro: 'REG-1' },
    mustChangePassword: true,
    isAuthenticated: true,
    hydrated: true,
  });
});

describe('ChangePasswordScreen', () => {
  it('valida nova senha curta (< 6) e não chama a API', async () => {
    renderScreen();
    fireEvent.changeText(screen.getByTestId('currentPassword'), '52998');
    fireEvent.changeText(screen.getByTestId('newPassword'), 'abc');
    fireEvent.changeText(screen.getByTestId('confirmNewPassword'), 'abc');
    fireEvent.press(screen.getByTestId('submit'));

    await waitFor(() => expect(screen.getByText('Mínimo de 6 caracteres')).toBeOnTheScreen());
    expect(mockedChange).not.toHaveBeenCalled();
  });

  it('valida confirmação divergente e não chama a API', async () => {
    renderScreen();
    fireEvent.changeText(screen.getByTestId('currentPassword'), '52998');
    fireEvent.changeText(screen.getByTestId('newPassword'), 'nova-senha-1');
    fireEvent.changeText(screen.getByTestId('confirmNewPassword'), 'outra-senha');
    fireEvent.press(screen.getByTestId('submit'));

    await waitFor(() => expect(screen.getByText('As senhas não coincidem')).toBeOnTheScreen());
    expect(mockedChange).not.toHaveBeenCalled();
  });

  it('sucesso: troca a senha e zera mustChangePassword', async () => {
    mockedChange.mockResolvedValue(undefined);
    renderScreen();

    fireEvent.changeText(screen.getByTestId('currentPassword'), '52998');
    fireEvent.changeText(screen.getByTestId('newPassword'), 'nova-senha-1');
    fireEvent.changeText(screen.getByTestId('confirmNewPassword'), 'nova-senha-1');
    fireEvent.press(screen.getByTestId('submit'));

    await waitFor(() => expect(useSessionStore.getState().mustChangePassword).toBe(false));
    expect(mockedChange).toHaveBeenCalledWith('52998', 'nova-senha-1');
  });

  it('senha atual incorreta (422): mostra a mensagem do server e mantém a sessão', async () => {
    mockedChange.mockRejectedValue({
      response: { status: 422, data: { message: 'Senha atual incorreta' } },
    });
    renderScreen();

    fireEvent.changeText(screen.getByTestId('currentPassword'), 'errada');
    fireEvent.changeText(screen.getByTestId('newPassword'), 'nova-senha-1');
    fireEvent.changeText(screen.getByTestId('confirmNewPassword'), 'nova-senha-1');
    fireEvent.press(screen.getByTestId('submit'));

    await waitFor(() => expect(screen.getByText('Senha atual incorreta')).toBeOnTheScreen());
    // 422 não é 401 → a sessão é preservada (não desloga).
    expect(useSessionStore.getState().isAuthenticated).toBe(true);
  });
});
