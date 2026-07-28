import axios from 'axios';

// Erros do app, classificados a partir do erro cru (Axios) — a UI consome estes
// tipos, não o erro técnico.
export type AppErrorKind =
  | 'network'
  | 'session-expired'
  | 'not-found'
  | 'unknown';

export interface AppError {
  kind: AppErrorKind;
  message: string;
}

const MESSAGES: Record<AppErrorKind, string> = {
  network: 'Sem conexão com a internet.',
  'session-expired': 'Sua sessão expirou. Entre novamente.',
  'not-found': 'Registro não encontrado.',
  unknown: 'Algo deu errado. Tente novamente.',
};

function appError(kind: AppErrorKind): AppError {
  return { kind, message: MESSAGES[kind] };
}

function statusOf(error: unknown): number | undefined {
  if (error && typeof error === 'object' && 'response' in error) {
    return (error as { response?: { status?: number } }).response?.status;
  }
  return undefined;
}

export function toAppError(error: unknown): AppError {
  // Falha de rede/offline: erro do Axios sem `response` (ou ERR_NETWORK).
  if (
    axios.isAxiosError(error) &&
    (!error.response || error.code === 'ERR_NETWORK')
  ) {
    return appError('network');
  }
  const status = statusOf(error);
  if (status === 401) return appError('session-expired');
  if (status === 404) return appError('not-found');
  return appError('unknown');
}
