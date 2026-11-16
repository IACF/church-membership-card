import { http } from './client';
import type { components } from '@/api/api-types';
import type { Member } from '@/model/member';

export async function getMe(): Promise<Member> {
  const { data } = await http.get<Member>('/members/me');
  return data;
}

export type Consentimentos = components['schemas']['ConsentimentosDto'];

// Escrita do consentimento pelo próprio titular. PUT com o estado desejado: a
// tela apresenta tudo junto e nada pode ficar meio gravado se a rede falhar.
// A versão do documento e a origem são definidas pelo SERVIDOR — o app não as
// envia, e enviá-las não teria efeito.
export async function putConsentimentos(desejado: {
  transferenciaInternacional: boolean;
}): Promise<Consentimentos> {
  const { data } = await http.put<Consentimentos>('/members/me/consentimentos', desejado);
  return data;
}
