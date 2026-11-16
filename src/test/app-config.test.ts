import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Identidade do app no app.json. São campos que ninguém lê durante o
// desenvolvimento — só aparecem na gaveta de apps e nas lojas — e que, errados,
// custam uma rodada inteira de fila do EAS para corrigir.
const expo = JSON.parse(readFileSync(join(__dirname, '..', '..', 'app.json'), 'utf8')).expo as {
  name: string;
  slug: string;
  android: {
    package: string;
    versionCode: number;
    blockedPermissions?: string[];
    permissions?: string[];
  };
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

describe('permissões do Android', () => {
  // A política de privacidade publicada afirma que o app "não solicita nenhuma
  // permissão do seu dispositivo — não acessa câmera, microfone, localização,
  // contatos, agenda, armazenamento nem arquivos", e o formulário de Segurança
  // de Dados da Play Store declara o mesmo.
  //
  // Isso NÃO é automático: o expo-file-system declara READ/WRITE_EXTERNAL_STORAGE
  // no manifesto dele, sem maxSdkVersion, e bibliotecas nativas trazem outras.
  // Elas entram no manifesto final por merge, aparecem na ficha da loja e
  // contradizem o que publicamos. `blockedPermissions` as remove na geração do
  // projeto nativo.
  //
  // Nenhuma delas é usada: o PDF é gravado no diretório interno do aplicativo e
  // aberto por content://, o que não exige permissão em versão alguma do Android.
  const BLOQUEADAS_OBRIGATORIAS = [
    'android.permission.READ_EXTERNAL_STORAGE',
    'android.permission.WRITE_EXTERNAL_STORAGE',
  ];

  it('bloqueia as permissões de armazenamento que a política diz não existir', () => {
    const bloqueadas: string[] = expo.android.blockedPermissions ?? [];
    for (const p of BLOQUEADAS_OBRIGATORIAS) {
      expect(bloqueadas).toContain(p);
    }
  });

  it('não declara nenhuma permissão própria em android.permissions', () => {
    // Se algum dia o app precisar de uma permissão de verdade, este teste falha
    // e obriga a atualizar a política ANTES de publicar.
    expect(expo.android.permissions).toBeUndefined();
  });
});
