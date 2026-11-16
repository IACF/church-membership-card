import { create } from 'zustand';
import { persister, queryClient } from '@/lib/queryClient';
import type { MemberBasic, Session } from '@/model/session';
import { clearSession, loadSession, saveSession } from './session.storage';

interface SessionState {
  token: string | null;
  member: MemberBasic | null;
  mustChangePassword: boolean;
  isAuthenticated: boolean;
  hydrated: boolean;
  setSession: (session: Session) => Promise<void>;
  markPasswordChanged: () => Promise<void>;
  clear: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  token: null,
  member: null,
  mustChangePassword: false,
  isAuthenticated: false,
  hydrated: false,

  setSession: async (session) => {
    await saveSession(session);
    set({
      token: session.token,
      member: session.member,
      mustChangePassword: session.mustChangePassword,
      isAuthenticated: true,
    });
  },

  markPasswordChanged: async () => {
    const { token, member } = get();
    if (token && member) {
      await saveSession({ token, member, mustChangePassword: false });
    }
    set({ mustChangePassword: false });
  },

  // Encerra a sessão apagando TUDO o que o app guardou do membro no aparelho.
  //
  // Não basta remover o token: o cache persistido do React Query guarda a query
  // ['me'] — nome, CPF, filiação, foto, igreja — no AsyncStorage, que não é
  // cifrado, com gcTime de 7 dias. Sem a limpeza abaixo, sair num aparelho
  // compartilhado deixava o dado pessoal legível por até uma semana.
  //
  // Também cobre o logout automático do 401 (src/api/client.ts), que chama este
  // mesmo `clear`.
  clear: async () => {
    await clearSession();
    // Ordem importa: zerar o cache em memória primeiro faz com que qualquer
    // gravação pendente do persister escreva um cache já vazio.
    queryClient.clear();
    await persister.removeClient();
    set({
      token: null,
      member: null,
      mustChangePassword: false,
      isAuthenticated: false,
    });
  },

  hydrate: async () => {
    const session = await loadSession();
    if (session) {
      set({
        token: session.token,
        member: session.member,
        mustChangePassword: session.mustChangePassword,
        isAuthenticated: true,
        hydrated: true,
      });
    } else {
      set({ hydrated: true });
    }
  },
}));
