// Tipo provisório do membro (Fase 1). Na Fase 3 será substituído pelo tipo
// gerado a partir do OpenAPI do servidor (church-membership-card-server).
export interface Member {
  nome: string;
  funcao: string;
  registro: string;
  igreja: string;
  filiacao: string;
  cpf: string;
  nascimento: string;
  estadoCivil: string;
  validade: string;
  presidente: string;
  secretario: string;
  qrCodeValue: string;
}
