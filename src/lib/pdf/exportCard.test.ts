import type { Member } from '@/model/member';

// --- Mocks dos módulos nativos e das dependências de montagem do HTML ---
// (nomes com prefixo `mock` — exigência do hoisting do jest.mock)
const mockPrintToFileAsync = jest.fn().mockResolvedValue({ uri: 'file:///tmp/print-xyz.pdf' });
const mockShareAsync = jest.fn().mockResolvedValue(undefined);
const mockIsAvailableAsync = jest.fn().mockResolvedValue(true);
const mockMove = jest.fn();
const mockDelete = jest.fn();

jest.mock('expo-print', () => ({
  printToFileAsync: (...a: unknown[]) => mockPrintToFileAsync(...a),
}));
jest.mock('expo-sharing', () => ({
  isAvailableAsync: () => mockIsAvailableAsync(),
  shareAsync: (...a: unknown[]) => mockShareAsync(...a),
}));
jest.mock('expo-file-system', () => {
  class File {
    uri: string;
    constructor(...parts: unknown[]) {
      this.uri = parts
        .map((p) => (typeof p === 'string' ? p : (p as { uri: string }).uri))
        .join('/');
    }
    get exists() {
      return false;
    }
    delete() {
      mockDelete();
    }
    move(dest: { uri: string }) {
      mockMove(this.uri, dest.uri);
      this.uri = dest.uri;
    }
  }
  return { File, Paths: { cache: { uri: 'file:///cache' } }, Directory: class {} };
});
jest.mock('./assets', () => ({
  resolveCardAssets: jest.fn().mockResolvedValue({
    brasao: 'b',
    logo: 'l',
    assinaturaPresidente: 'p',
    assinaturaSecretario: 's',
  }),
}));
jest.mock('./qr', () => ({ buildQrSvg: jest.fn().mockResolvedValue('<svg></svg>') }));

import { exportCardPdf, pdfFileName } from './exportCard';

const member: Member = {
  nomeCompleto: 'José da Conceição',
  cpf: '11144477735',
  registro: '2024003',
  whatsapp: '87999998888',
  funcao: 'Pastor',
  cnpj: '66.551.138/0001-97',
  igreja: 'AD Logos',
  nomeMae: 'Maria',
  filiacao: 'Maria',
  nascimento: '1993-07-19',
  estadoCivil: 'Casado(a)',
  inadimplente: false,
  presidente: 'Presidente',
  secretario: 'Secretário',
};

beforeEach(() => jest.clearAllMocks());

describe('pdfFileName', () => {
  it('normaliza acentos e símbolos no nome do arquivo', () => {
    expect(pdfFileName(member)).toBe('Carteirinha_COPVASF_Jose_da_Conceicao.pdf');
  });
});

describe('exportCardPdf (nativo)', () => {
  it('gera o PDF, renomeia para o nome amigável e compartilha', async () => {
    await exportCardPdf(member);

    // gerou a partir do HTML
    expect(mockPrintToFileAsync).toHaveBeenCalledTimes(1);
    expect(mockPrintToFileAsync.mock.calls[0][0].html).toContain('José da Conceição');

    // renomeou o arquivo de saída para o nome amigável
    expect(mockMove).toHaveBeenCalledWith(
      'file:///tmp/print-xyz.pdf',
      'file:///cache/Carteirinha_COPVASF_Jose_da_Conceicao.pdf',
    );

    // compartilhou o arquivo renomeado como PDF
    expect(mockShareAsync).toHaveBeenCalledTimes(1);
    expect(mockShareAsync.mock.calls[0][0]).toBe(
      'file:///cache/Carteirinha_COPVASF_Jose_da_Conceicao.pdf',
    );
  });

  it('falha na geração → lança AppError (não vaza o erro cru)', async () => {
    mockPrintToFileAsync.mockRejectedValueOnce(new Error('boom'));

    await expect(exportCardPdf(member)).rejects.toMatchObject({
      kind: expect.any(String),
      message: expect.any(String),
    });
  });
});
