import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Invariantes dos assets de marca que QUEBRAM a publicação e não se enxergam a
// olho nu. O ícone com canal alfa, por exemplo, é recusado pela App Store no
// envio — depois de a build inteira já ter rodado.
const raiz = join(__dirname, '..', '..');

// Lê largura, altura e tipo de cor direto do cabeçalho IHDR do PNG, sem
// depender de biblioteca de imagem (o app não tem nenhuma instalada).
function lePng(rel: string) {
  const d = readFileSync(join(raiz, rel));
  const assinatura = d.subarray(0, 8);
  const esperado = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const largura = d.readUInt32BE(16);
  const altura = d.readUInt32BE(20);
  const tipoCor = d.readUInt8(25);
  // tipos com alfa: 4 (cinza+alfa) e 6 (RGBA)
  return {
    ehPng: assinatura.equals(esperado),
    largura,
    altura,
    temAlfa: tipoCor === 4 || tipoCor === 6,
  };
}

describe('assets de ícone e marca', () => {
  it('icon.png é 1024×1024 e SEM canal alfa (a App Store recusa com alfa)', () => {
    const i = lePng('assets/icon.png');
    expect(i.ehPng).toBe(true);
    expect([i.largura, i.altura]).toEqual([1024, 1024]);
    expect(i.temAlfa).toBe(false);
  });

  it.each(['assets/adaptive-icon.png', 'assets/splash-icon.png'])(
    '%s é 1024×1024 e TEM alfa (é só o primeiro plano; o fundo vem do app.json)',
    (rel) => {
      const i = lePng(rel);
      expect([i.largura, i.altura]).toEqual([1024, 1024]);
      expect(i.temAlfa).toBe(true);
    },
  );

  it('a marca do boot existe e tem alfa', () => {
    const i = lePng('assets/copvasf-marca.png');
    expect(i.temAlfa).toBe(true);
    expect(i.largura).toBeGreaterThan(600);
  });

  // Os placeholders do Expo são PNG de PALETA (tipo 3). Os nossos são RGB/RGBA.
  // Se alguém rodar `expo prebuild --clean` ou restaurar um default por engano,
  // este teste avisa antes de a build ir para a loja com o círculo cinza.
  it('nenhum asset é mais o placeholder cinza do Expo', () => {
    for (const rel of ['assets/icon.png', 'assets/adaptive-icon.png', 'assets/splash-icon.png']) {
      const d = readFileSync(join(raiz, rel));
      expect(d.readUInt8(25)).not.toBe(3); // 3 = paleta indexada
    }
  });
});
