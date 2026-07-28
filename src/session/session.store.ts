import { create } from 'zustand';
import type { MemberBasic, Session } from '@/model/session';
import {
  clearSession,
  loadSession,
  saveSession,
} from './session.storage';

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

  clear: async () => {
    await clearSession();
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
