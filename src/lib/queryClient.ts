import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
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

// Persiste o cache no AsyncStorage → a carteirinha (query ['me']) reaparece
// offline com a última sincronização. Mora aqui, e não em app/_layout.tsx, porque
// o logout precisa apagar o que foi gravado: o AsyncStorage NÃO é cifrado e o
// cache guarda dado pessoal (nome, CPF, filiação, foto, igreja).
export const persister = createAsyncStoragePersister({ storage: AsyncStorage });
