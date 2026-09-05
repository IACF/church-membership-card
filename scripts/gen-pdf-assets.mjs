// Gera src/lib/pdf/assets.base64.ts com os PNGs do card embutidos como data URI.
//
// POR QUE ISTO EXISTE: num APK de release o Metro compila as imagens de `require()`
// como RECURSOS Android (res/), não como arquivos — não há caminho de sistema de
// arquivos para elas. Resolver o asset em runtime e ler com `File(uri).base64()`
// funciona no dev (onde o Metro serve o arquivo e ele vai para o cache) e falha no
// APK com "java.lang.IllegalArgumentException: URI is not absolute".
// Embutir em tempo de build elimina a resolução em runtime e vale para dev, release,
// nativo e web — o mesmo caminho de código em todos.
//
// Rodar após trocar qualquer imagem do card:  node scripts/gen-pdf-assets.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const ASSETS = {
  BRASAO_DATA_URL: 'assets/brasao-republica.png',
  LOGO_DATA_URL: 'assets/copvasf-logo.png',
  SIG_PRESIDENTE_DATA_URL: 'assets/assinatura-presidente.png',
  SIG_SECRETARIO_DATA_URL: 'assets/assinatura-secretario.png',
};

const lines = [
  '// ARQUIVO GERADO — não edite à mão.',
  '// Origem: scripts/gen-pdf-assets.mjs (rode-o após trocar as imagens do card).',
  '//',
  '// Os PNGs do card viajam embutidos como data URI porque, num APK de release, as',
  '// imagens de `require()` viram recursos Android e não têm caminho de arquivo —',
  '// lê-las em runtime falha com "URI is not absolute".',
  '',
];

for (const [name, file] of Object.entries(ASSETS)) {
  const base64 = readFileSync(join(root, file)).toString('base64');
  lines.push(`// ${file}`);
  lines.push(`export const ${name} = 'data:image/png;base64,${base64}';`);
  lines.push('');
}

const out = join(root, 'src/lib/pdf/assets.base64.ts');
writeFileSync(out, lines.join('\n'));
console.log(
  `gerado: src/lib/pdf/assets.base64.ts (${(lines.join('\n').length / 1024).toFixed(0)} KB)`,
);
