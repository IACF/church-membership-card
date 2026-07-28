import { useMutation } from '@tanstack/react-query';
import { login } from '@/api/auth.api';
import { useSessionStore } from '@/session/session.store';

interface LoginVars {
  identifier: string;
  password: string;
}

export function useLogin() {
  const setSession = useSessionStore((s) => s.setSession);
  return useMutation({
    mutationFn: ({ identifier, password }: LoginVars) =>
      login(identifier, password),
    onSuccess: async (data) => {
      await setSession({
        token: data.token,
        member: data.member,
        mustChangePassword: data.mustChangePassword,
      });
    },
  });
}
