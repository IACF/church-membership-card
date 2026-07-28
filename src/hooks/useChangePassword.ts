import { useMutation } from '@tanstack/react-query';
import { changePassword } from '@/api/auth.api';
import { useSessionStore } from '@/session/session.store';

interface ChangePasswordVars {
  currentPassword: string;
  newPassword: string;
}

export function useChangePassword() {
  const markPasswordChanged = useSessionStore((s) => s.markPasswordChanged);
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: ChangePasswordVars) =>
      changePassword(currentPassword, newPassword),
    onSuccess: async () => {
      await markPasswordChanged();
    },
  });
}
