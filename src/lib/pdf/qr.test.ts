import { validationUrl, buildQrSvg } from './qr';

describe('validationUrl', () => {
  it('monta <base>/validar/<registro> com o registro codificado', () => {
    // A base default nos testes é http://localhost:3000 (sem env de validação).
    expect(validationUrl('2024003')).toBe('http://localhost:3000/validar/2024003');
  });

  it('codifica caracteres especiais do registro', () => {
    expect(validationUrl('REG 01/A')).toBe('http://localhost:3000/validar/REG%2001%2FA');
  });
});

describe('buildQrSvg', () => {
  it('gera um SVG (string) do QR', async () => {
    const svg = await buildQrSvg('2024003');
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
  });
});
