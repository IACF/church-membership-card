import { http } from './client';
import type { Member } from '@/model/member';

export async function getMe(): Promise<Member> {
  const { data } = await http.get<Member>('/members/me');
  return data;
}
