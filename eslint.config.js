// ESLint 9 (flat config) — base do Expo (React/RN/hooks/import) + compat Prettier.
const expoConfig = require('eslint-config-expo/flat');
const eslintConfigPrettier = require('eslint-config-prettier');

module.exports = [
  ...expoConfig,
  eslintConfigPrettier,
  {
    rules: {
      // A API Animated do RN lê `ref.current` (um Animated.Value) durante o render
      // para montar interpolações — padrão válido; a regra do React Compiler não se aplica.
      'react-hooks/refs': 'off',
    },
  },
  {
    ignores: [
      'dist/*',
      '.expo/*',
      'node_modules/*',
      'coverage/*',
      // gerado do OpenAPI
      'src/api/api-types.ts',
    ],
  },
];
