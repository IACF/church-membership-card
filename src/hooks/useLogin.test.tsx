import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';
import { useLogin } from '@/hooks/useLogin';
import { useSessionStore } from '@/session/session.store';
import * as authApi from '@/api/auth.api';

jest.mock('@/api/auth.api');
const mockedLogin = authApi.login as jest.MockedFunction<typeof authApi.login>;

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

beforeEach(() => {
  jest.clearAllMocks();
  useSessionStore.setState({
    token: null,
    member: null,
    mustChangePassword: false,
    isAuthenticated: false,
    hydrated: false,
  });
});

describe('useLogin', () => {
  it('sucesso: grava a sessão no store (token + mustChangePassword)', async () => {
    mockedLogin.mockResolvedValue({
      token: 'tok-1',
      mustChangePassword: true,
      member: { id: 'm1', nomeCompleto: 'Fulano Teste', registro: 'REG-1' },
    });

    const { result } = renderHook(() => useLogin(), { wrapper });
    result.current.mutate({ identifier: 'REG-1', password: '52998' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const state = useSessionStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.token).toBe('tok-1');
    expect(state.mustChangePassword).toBe(true);
    expect(state.member?.nomeCompleto).toBe('Fulano Teste');
  });

  it('erro: mantém a sessão vazia e expõe o erro', async () => {
    mockedLogin.mockRejectedValue({ response: { status: 401 } });

    const { result } = renderHook(() => useLogin(), { wrapper });
    result.current.mutate({ identifier: 'REG-1', password: 'errada' });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(useSessionStore.getState().isAuthenticated).toBe(false);
  });
});
