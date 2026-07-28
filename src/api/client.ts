import axios, { AxiosError } from 'axios';
import { useSessionStore } from '@/session/session.store';

// Na web o browser alcança o loopback da api; no device usar o IP da máquina via
// EXPO_PUBLIC_API_URL (ver plano/README).
const baseURL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export const http = axios.create({ baseURL });

// Injeta o JWT da sessão em toda requisição.
http.interceptors.request.use((config) => {
  const token = useSessionStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 401 numa requisição autenticada = token expirado/inválido → encerra a sessão
// (o guard reage e leva ao login). Auto-refresh fica para a Fase 5.
http.interceptors.response.use(undefined, (error: AxiosError) => {
  if (error.response?.status === 401 && useSessionStore.getState().isAuthenticated) {
    void useSessionStore.getState().clear();
  }
  return Promise.reject(error);
});
