import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';
import { useChangePassword } from '@/hooks/useChangePassword';
import { useSessionStore } from '@/session/session.store';
import * as authApi from '@/api/auth.api';

jest.mock('@/api/auth.api');
const mockedChange = authApi.changePassword as jest.MockedFunction<
  typeof authApi.changePassword
>;

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

beforeEach(async () => {
  jest.clearAllMocks();
  useSessionStore.setState({
    token: 't',
    member: { id: 'm', nomeCompleto: 'Nome', registro: 'REG-1' },
    mustChangePassword: true,
    isAuthenticated: true,
    hydrated: true,
  });
});

describe('useChangePassword', () => {
  it('sucesso: zera mustChangePassword', async () => {
    mockedChange.mockResolvedValue(undefined);
    const { result } = renderHook(() => useChangePassword(), { wrapper });

    result.current.mutate({
      currentPassword: '52998',
      newPassword: 'nova-senha-1',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedChange).toHaveBeenCalledWith('52998', 'nova-senha-1');
    expect(useSessionStore.getState().mustChangePassword).toBe(false);
  });

  it('erro: mantém mustChangePassword true', async () => {
    mockedChange.mockRejectedValue({ response: { status: 401 } });
    const { result } = renderHook(() => useChangePassword(), { wrapper });

    result.current.mutate({ currentPassword: 'errada', newPassword: 'abcdef' });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(useSessionStore.getState().mustChangePassword).toBe(true);
  });
});
