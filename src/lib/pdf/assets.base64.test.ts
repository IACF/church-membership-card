import {
  BRASAO_DATA_URL,
  LOGO_DATA_URL,
  SIG_PRESIDENTE_DATA_URL,
  SIG_SECRETARIO_DATA_URL,
} from './assets.base64';

// Os assets do card viajam embutidos porque, num APK de release, as imagens de
// `require()` viram recursos Android e não têm caminho de arquivo — lê-las em
// runtime falhava com "URI is not absolute". Estes testes garantem que o arquivo
// gerado (scripts/gen-pdf-assets.mjs) contém PNGs íntegros, e não strings vazias
// ou truncadas, que quebrariam o PDF de forma silenciosa.
const ASSETS = {
  brasao: BRASAO_DATA_URL,
  logo: LOGO_DATA_URL,
  assinaturaPresidente: SIG_PRESIDENTE_DATA_URL,
  assinaturaSecretario: SIG_SECRETARIO_DATA_URL,
};

// Assinatura de arquivo PNG: \x89 P N G \r \n \x1a \n
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

describe('assets embutidos do card', () => {
  it.each(Object.entries(ASSETS))('%s é um data URI de PNG válido', (_name, dataUrl) => {
    expect(dataUrl).toMatch(/^data:image\/png;base64,/);

    const base64 = dataUrl.replace(/^data:image\/png;base64,/, '');
    const bytes = Buffer.from(base64, 'base64');

    expect(bytes.subarray(0, 8)).toEqual(PNG_MAGIC);
    expect(bytes.byteLength).toBeGreaterThan(1024);
  });

  it('nenhum asset depende de resolução em runtime', () => {
    for (const dataUrl of Object.values(ASSETS)) {
      expect(dataUrl.startsWith('data:')).toBe(true);
      expect(dataUrl).not.toContain('file://');
      expect(dataUrl).not.toContain('asset:');
    }
  });
});
