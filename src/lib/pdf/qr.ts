import QRCode from 'qrcode';
import { VALIDATION_BASE_URL } from '@/lib/config';

// URL de autenticidade que o QR codifica: o endpoint público do server que
// redireciona para o link cadastrado pelo admin (ou mostra a página padrão).
export function validationUrl(registro: string): string {
  const base = VALIDATION_BASE_URL.replace(/\/+$/, '');
  return `${base}/validar/${encodeURIComponent(registro)}`;
}

// Gera o QR como SVG (string) para embutir no HTML do PDF. SVG mantém o QR
// vetorial/nítido na impressão e o builder de HTML puro/testável.
export async function buildQrSvg(registro: string): Promise<string> {
  return QRCode.toString(validationUrl(registro), {
    type: 'svg',
    margin: 1,
    errorCorrectionLevel: 'M',
  });
}
