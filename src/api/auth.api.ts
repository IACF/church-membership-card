import { http } from './client';
import type { LoginResponse } from '@/model/session';

export async function login(
  identifier: string,
  password: string,
): Promise<LoginResponse> {
  const { data } = await http.post<LoginResponse>('/auth/login', {
    identifier,
    password,
  });
  return data;
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  await http.post('/auth/change-password', { currentPassword, newPassword });
}
