import { QueryClient } from '@tanstack/react-query';

// Persistência offline do cache entra na Fase 5 (resiliência).
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});
