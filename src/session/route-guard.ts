// Lógica pura de redirecionamento do guard de sessão (testável sem o router).
// Recebe o estado da sessão e os segmentos da rota atual; devolve o destino ou
// null (quando já está na rota correta).

export interface GuardState {
  isAuthenticated: boolean;
  mustChangePassword: boolean;
}

export function resolveRedirect(
  state: GuardState,
  segments: string[],
): string | null {
  const inAuthGroup = segments[0] === '(auth)';
  const inAppGroup = segments[0] === '(app)';
  const onChangePw = inAuthGroup && segments[1] === 'change-password';
  const onLogin = inAuthGroup && segments[1] === 'login';

  if (!state.isAuthenticated) {
    return onLogin ? null : '/(auth)/login';
  }
  if (state.mustChangePassword) {
    return onChangePw ? null : '/(auth)/change-password';
  }
  return inAppGroup ? null : '/(app)';
}
