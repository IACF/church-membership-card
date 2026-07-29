import type { Member } from './member';

// Fixture usado só em testes de componente (o app real busca de GET /members/me).
// Valores no shape do contrato: cpf em dígitos, nascimento YYYY-MM-DD.
export const memberFixture: Member = {
  nomeCompleto: 'Lucas de Souza Conceição',
  cpf: '05817865564',
  registro: '2024003',
  whatsapp: '87999998888',
  funcao: 'Pastor',
  igreja: 'Assembleia de Deus Ministério Logos',
  nomePai: 'Raimundo Marques da Conceição',
  nomeMae: 'Maria Janete de Souza Conceição',
  filiacao: 'Raimundo Marques da Conceição e Maria Janete de Souza Conceição',
  nascimento: '1993-07-19',
  estadoCivil: 'Casado(a)',
  inadimplente: false,
  presidente: 'José Humberto S. Santos',
  secretario: 'Lucas de Souza Conceição',
};
