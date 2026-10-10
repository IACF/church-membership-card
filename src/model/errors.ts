import axios from 'axios';

// Erros do app, classificados a partir do erro cru (Axios) — a UI consome estes
// tipos, não o erro técnico.
export type AppErrorKind = 'network' | 'session-expired' | 'not-found' | 'unknown';

export interface AppError {
  kind: AppErrorKind;
  message: string;
  // Detalhe técnico (etapa + erro original). Só populado em falhas nativas, onde a
  // mensagem amigável sozinha não permite diagnosticar. A UI mostra em segundo plano.
  detail?: string;
}

const MESSAGES: Record<AppErrorKind, string> = {
  network: 'Sem conexão com a internet.',
  'session-expired': 'Sua sessão expirou. Entre novamente.',
  'not-found': 'Registro não encontrado.',
  unknown: 'Algo deu errado. Tente novamente.',
};

function appError(kind: AppErrorKind, detail?: string): AppError {
  return detail ? { kind, message: MESSAGES[kind], detail } : { kind, message: MESSAGES[kind] };
}

// Reconhece um AppError já classificado — `toAppError` é aplicado duas vezes no
// caminho do export (no exportCardPdf e de novo no hook) e sem isto o `detail`
// se perderia na segunda passagem.
function isAppError(error: unknown): error is AppError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'kind' in error &&
    'message' in error &&
    typeof (error as AppError).message === 'string'
  );
}

function statusOf(error: unknown): number | undefined {
  if (error && typeof error === 'object' && 'response' in error) {
    return (error as { response?: { status?: number } }).response?.status;
  }
  return undefined;
}

export function toAppError(error: unknown): AppError {
  // Já classificado: devolve como está (preserva o `detail`).
  if (isAppError(error)) return error;

  // Falha de rede/offline: erro do Axios sem `response` (ou ERR_NETWORK).
  if (axios.isAxiosError(error) && (!error.response || error.code === 'ERR_NETWORK')) {
    return appError('network');
  }
  const status = statusOf(error);
  if (status === 401) return appError('session-expired');
  if (status === 404) return appError('not-found');
  return appError('unknown');
}
