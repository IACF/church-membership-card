import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import React from 'react';
import LoginScreen from '../../../app/(auth)/login';
import * as authApi from '@/api/auth.api';
import { useSessionStore } from '@/session/session.store';

jest.mock('@/api/auth.api');
const mockedLogin = authApi.login as jest.MockedFunction<typeof authApi.login>;

function renderScreen() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <LoginScreen />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  useSessionStore.setState({
    token: null,
    member: null,
    mustChangePassword: false,
    isAuthenticated: false,
    hydrated: true,
  });
});

describe('LoginScreen', () => {
  it('validação: submissão vazia mostra erros e não chama a API', async () => {
    renderScreen();
    fireEvent.press(screen.getByTestId('submit'));

    await waitFor(() =>
      expect(screen.getByText('Informe o registro ou CPF')).toBeOnTheScreen(),
    );
    expect(mockedLogin).not.toHaveBeenCalled();
  });

  it('sucesso: chama a API e grava a sessão', async () => {
    mockedLogin.mockResolvedValue({
      token: 't',
      mustChangePassword: true,
      member: { id: 'm', nomeCompleto: 'Nome Teste', registro: 'REG-1' },
    });
    renderScreen();

    fireEvent.changeText(screen.getByTestId('identifier'), 'REG-1');
    fireEvent.changeText(screen.getByTestId('password'), '52998');
    fireEvent.press(screen.getByTestId('submit'));

    await waitFor(() =>
      expect(useSessionStore.getState().isAuthenticated).toBe(true),
    );
    expect(mockedLogin).toHaveBeenCalledWith('REG-1', '52998');
  });

  it('erro 401: mostra mensagem de credenciais', async () => {
    mockedLogin.mockRejectedValue({ response: { status: 401 } });
    renderScreen();

    fireEvent.changeText(screen.getByTestId('identifier'), 'REG-1');
    fireEvent.changeText(screen.getByTestId('password'), 'errada');
    fireEvent.press(screen.getByTestId('submit'));

    await waitFor(() =>
      expect(
        screen.getByText('Registro/CPF ou senha inválidos'),
      ).toBeOnTheScreen(),
    );
  });

  it('sem conexão: mostra mensagem de rede', async () => {
    const { AxiosError } = require('axios');
    mockedLogin.mockRejectedValue(new AxiosError('offline', 'ERR_NETWORK'));
    renderScreen();

    fireEvent.changeText(screen.getByTestId('identifier'), 'REG-1');
    fireEvent.changeText(screen.getByTestId('password'), '52998');
    fireEvent.press(screen.getByTestId('submit'));

    await waitFor(() =>
      expect(screen.getByText('Sem conexão com a internet.')).toBeOnTheScreen(),
    );
  });
});
