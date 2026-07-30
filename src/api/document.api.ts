import { http } from './client';
import type { AppDocument, DocumentLocation } from '@/model/document';

// Lista os documentos de um local (Documentos ou Informações do conselho). O JWT
// do membro é injetado pelo interceptor de api/client.ts.
export async function getDocuments(location: DocumentLocation): Promise<AppDocument[]> {
  const { data } = await http.get<AppDocument[]>('/documents', { params: { location } });
  return data;
}
