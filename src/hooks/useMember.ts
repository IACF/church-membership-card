import { useQuery } from '@tanstack/react-query';
import { getMe } from '@/api/member.api';

// Dados da carteirinha do membro logado. Re-busca ao focar e periodicamente para
// refletir edições do admin; em 401 (membro removido/expirado) o interceptor de
// api/client.ts encerra a sessão → guard leva ao login.
export function useMember() {
  return useQuery({
    queryKey: ['me'],
    queryFn: getMe,
    retry: false,
    refetchOnWindowFocus: true,
    refetchInterval: 30_000,
  });
}
