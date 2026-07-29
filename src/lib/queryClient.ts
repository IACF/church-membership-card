import { QueryClient } from '@tanstack/react-query';

const MINUTE = 1000 * 60;
export const DAY = MINUTE * 60 * 24;

// gcTime alto (≥ maxAge do persister) mantém o cache no disco entre aberturas →
// carteirinha aparece offline (persistência configurada em app/_layout.tsx).
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: MINUTE * 5,
      gcTime: DAY * 7,
    },
  },
});
