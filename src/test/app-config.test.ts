import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Identidade do app no app.json. São campos que ninguém lê durante o
// desenvolvimento — só aparecem na gaveta de apps e nas lojas — e que, errados,
// custam uma rodada inteira de fila do EAS para corrigir.
const expo = JSON.parse(readFileSync(join(__dirname, '..', '..', 'app.json'), 'utf8')).expo as {
  name: string;
  slug: string;
  android: { package: string; versionCode: number };
  ios: { bundleIdentifier?: string };
};

describe('identidade do app', () => {
  it('name é o nome de exibição, com maiúscula', () => {
    // É o rótulo embaixo do ícone. O `slug` é outra coisa: identifica o projeto
    // no EAS e tem de continuar minúsculo.
    expect(expo.name).toBe('Copvasf');
    expect(expo.slug).toBe('copvasf');
  });

  it('iOS e Android compartilham o mesmo identificador', () => {
    // Divergir aqui cria dois apps distintos nas lojas, com o mesmo nome.
    expect(expo.ios.bundleIdentifier).toBe(expo.android.package);
  });

  it('versionCode é inteiro positivo', () => {
    // `appVersionSource: local` no eas.json: este número não é incrementado
    // automaticamente, e repetido faz o Android não reconhecer a atualização.
    expect(Number.isInteger(expo.android.versionCode)).toBe(true);
    expect(expo.android.versionCode).toBeGreaterThan(0);
  });
});
