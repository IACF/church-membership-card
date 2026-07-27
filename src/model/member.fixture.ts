import type { Member } from './member';

// TEMPORÁRIO (Fase 1): dados estáticos apenas para o app bootar e para os testes.
// Será removido na Fase 3/4, quando os dados virão da API via useMember.
export const memberFixture: Member = {
  nome: 'Lucas de Souza Conceição',
  funcao: 'Pastor/Secretário',
  registro: '2024003',
  igreja: 'Assembleia de Deus Ministério Logos',
  filiacao: 'Maria Janete de Souza Conceição e Raimundo Marques da Conceição',
  cpf: '058.178.655-64',
  nascimento: '19/07/1993',
  estadoCivil: 'Casado',
  validade: '31/12/2025',
  presidente: 'José Humberto S. Santos',
  secretario: 'Lucas de Souza Conceição',
  qrCodeValue: 'https://copvasf.org.br/membro/2024003',
};
