// Configuração de ambiente do app.

// Base pública alcançada pelo QR de autenticidade impresso no PDF da carteirinha
// (feature exportacao-pdf): o QR aponta para `${VALIDATION_BASE_URL}/validar/<registro>`,
// endpoint público do server. Precisa ser um endereço alcançável por qualquer
// celular que escaneie o QR (em prod, o domínio público; em dev, o IP da máquina).
// Reusa a mesma base pública da API (EXPO_PUBLIC_API_URL) — é o mesmo server e o
// endpoint /validar não tem prefixo. Um EXPO_PUBLIC_VALIDATION_BASE_URL dedicado
// pode sobrescrever caso o domínio do QR precise diferir da API no futuro.
export const VALIDATION_BASE_URL =
  process.env.EXPO_PUBLIC_VALIDATION_BASE_URL ??
  process.env.EXPO_PUBLIC_API_URL ??
  'http://localhost:3000';
