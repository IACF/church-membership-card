// Tipos da sessão do membro — aliases dos tipos GERADOS do OpenAPI do server
// (nunca escrever à mão o contrato). Ver src/api/api-types.ts (gen:api).
import type { components } from '@/api/api-types';

export type MemberLoginBody = components['schemas']['MemberLoginDto'];
export type LoginResponse = components['schemas']['MemberLoginResponseDto'];
export type MemberBasic = components['schemas']['MemberBasicDto'];
export type ChangePasswordBody = components['schemas']['ChangePasswordDto'];

// Sessão que o app mantém em memória/armazenamento (derivada da resposta de login).
export interface Session {
  token: string;
  member: MemberBasic;
  mustChangePassword: boolean;
}
