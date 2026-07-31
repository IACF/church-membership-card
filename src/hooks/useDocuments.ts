import { useQuery } from '@tanstack/react-query';
import { getDocuments } from '@/api/document.api';
import type { DocumentLocation } from '@/model/document';

// Documentos de um local. Re-busca ao focar a tela e ao montar para refletir
// publicações/edições/remoções do admin. Sem intervalo — o conteúdo muda pouco.
export function useDocuments(location: DocumentLocation) {
  return useQuery({
    queryKey: ['documents', location],
    queryFn: () => getDocuments(location),
    retry: false,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
}
