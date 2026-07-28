import { useSessionStore } from '@/session/session.store';

// Fachada de leitura/ações da sessão para a UI e o guard de rotas.
export function useSession() {
  const isAuthenticated = useSessionStore((s) => s.isAuthenticated);
  const mustChangePassword = useSessionStore((s) => s.mustChangePassword);
  const hydrated = useSessionStore((s) => s.hydrated);
  const member = useSessionStore((s) => s.member);
  const logout = useSessionStore((s) => s.clear);
  const hydrate = useSessionStore((s) => s.hydrate);
  return { isAuthenticated, mustChangePassword, hydrated, member, logout, hydrate };
}
