// AppDocument = alias do tipo GERADO do OpenAPI (resposta de GET /documents).
// Nunca escrever o contrato à mão — regenerar com `gen:api` após mudar o endpoint.
import type { components } from '@/api/api-types';

export type AppDocument = components['schemas']['DocumentDto'];

// Locais de exibição — correspondem 1:1 às telas do app.
export type DocumentLocation = AppDocument['location'];
