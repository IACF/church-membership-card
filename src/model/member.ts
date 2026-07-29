// Member = alias do tipo GERADO do OpenAPI (resposta de GET /members/me).
// Nunca escrever o contrato à mão — regenerar com `gen:api` após mudar o endpoint.
import type { components } from '@/api/api-types';

export type Member = components['schemas']['MeResponseDto'];
