import { waitFor } from '@testing-library/react-native';
import { AxiosError } from 'axios';
import { handleResponseError } from './client';
import { useSessionStore } from '@/session/session.store';

function setAuthenticated() {
  useSessionStore.setState({
    token: 't',
    member: { id: 'm', nomeCompleto: 'Nome', registro: 'REG-1' },
    mustChangePassword: false,
    isAuthenticated: true,
    hydrated: true,
  });
}

describe('handleResponseError (interceptor)', () => {
  it('401 autenticado → encerra a sessão', async () => {
    setAuthenticated();
    const err = { response: { status: 401 } } as AxiosError;
    await expect(handleResponseError(err)).rejects.toBe(err);
    // clear() é assíncrono (limpa o storage antes de zerar o estado)
    await waitFor(() => expect(useSessionStore.getState().isAuthenticated).toBe(false));
  });

  it('erro de rede (sem response) → mantém a sessão', async () => {
    setAuthenticated();
    const err = new AxiosError('offline', 'ERR_NETWORK');
    await expect(handleResponseError(err)).rejects.toBe(err);
    expect(useSessionStore.getState().isAuthenticated).toBe(true);
  });
});
