import { AxiosError } from 'axios';
import { toAppError } from './errors';

describe('toAppError', () => {
  it('erro de rede (Axios sem response) → network', () => {
    expect(toAppError(new AxiosError('falhou', 'ERR_NETWORK')).kind).toBe('network');
  });

  it('401 → session-expired', () => {
    expect(toAppError({ response: { status: 401 } }).kind).toBe('session-expired');
  });

  it('404 → not-found', () => {
    expect(toAppError({ response: { status: 404 } }).kind).toBe('not-found');
  });

  it('erro desconhecido → unknown', () => {
    expect(toAppError(new Error('qualquer')).kind).toBe('unknown');
  });

  it('sempre traz uma mensagem em PT-BR', () => {
    expect(toAppError(new AxiosError('x', 'ERR_NETWORK')).message).toMatch(/internet/i);
  });
});
