import type { Member } from '@/model/member';

// Cada download registra PARA ONDE escreveu e DE ONDE baixou, para o teste poder
// provar que as três imagens não disputam o mesmo arquivo de cache.
const downloads: { url: string; dest: string }[] = [];

jest.mock('expo-file-system', () => {
  class File {
    uri: string;
    constructor(...parts: unknown[]) {
      this.uri = parts
        .map((p) => (typeof p === 'string' ? p : (p as { uri: string }).uri))
        .join('/');
    }
    get exists() {
      return true;
    }
    delete() {}
    // O base64 devolvido identifica o ARQUIVO — se duas descargas colidirem no
    // mesmo caminho, o conteúdo sai trocado e o teste detecta.
    base64() {
      const reg = downloads.find((d) => d.dest === this.uri);
      return Promise.resolve(`B64<${reg ? reg.url : 'DESCONHECIDO'}>`);
    }
    static downloadFileAsync(url: string, dest: { uri: string }) {
      downloads.push({ url, dest: dest.uri });
      return Promise.resolve(new File(dest.uri));
    }
  }
  return { File, Paths: { cache: { uri: 'file:///cache' } }, Directory: class {} };
});

jest.mock('react-native', () => ({ Platform: { OS: 'android' } }));

import { resolveCardAssets } from './assets';

const FOTO = 'https://copvasf.com.br/uploads/members/foto.jpg?v=1';
const SIG1 = 'https://copvasf.com.br/uploads/signatures/presidente.png?v=2';
const SIG2 = 'https://copvasf.com.br/uploads/signatures/vice-presidente.png?v=3';

const member = {
  nomeCompleto: 'Lucas de Souza Conceição',
  photoUrl: FOTO,
  assinaturas: [
    { nome: 'José Humberto S. Santos', cargo: 'Presidente do COPVASF', imagemUrl: SIG1 },
    { nome: 'Luide Carlos Silva Santana', cargo: 'Vice-presidente', imagemUrl: SIG2 },
  ],
} as unknown as Member;

beforeEach(() => {
  downloads.length = 0;
});

// REGRESSÃO: em produção a FOTO do membro saiu impressa no lugar da assinatura.
// Causa: as três imagens baixavam para o mesmo arquivo de cache (nome fixo) e,
// como resolveCardAssets as dispara em Promise.all, uma sobrescrevia a outra.
describe('resolveCardAssets — foto e assinaturas não podem se misturar', () => {
  it('usa um arquivo de cache DISTINTO para cada imagem', async () => {
    await resolveCardAssets(member);

    const destinos = downloads.map((d) => d.dest);
    expect(destinos).toHaveLength(3);
    expect(new Set(destinos).size).toBe(3);
  });

  it('cada imagem carrega o conteúdo da SUA origem', async () => {
    const assets = await resolveCardAssets(member);

    expect(assets.photo).toContain(FOTO);
    expect(assets.assinaturaPresidente).toContain(SIG1);
    expect(assets.assinaturaSecretario).toContain(SIG2);
  });

  it('a assinatura nunca recebe o conteúdo da foto', async () => {
    const assets = await resolveCardAssets(member);

    expect(assets.assinaturaPresidente).not.toContain(FOTO);
    expect(assets.assinaturaSecretario).not.toContain(FOTO);
  });

  it('rotula o MIME pela extensão: PNG na assinatura, JPEG na foto', async () => {
    const assets = await resolveCardAssets(member);

    expect(assets.assinaturaSecretario).toMatch(/^data:image\/png;base64,/);
    expect(assets.photo).toMatch(/^data:image\/jpeg;base64,/);
  });
});
