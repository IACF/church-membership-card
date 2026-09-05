const mockStartActivityAsync = jest.fn().mockResolvedValue(undefined);
const mockGetContentUriAsync = jest.fn().mockResolvedValue('content://br.org.copvasf/cache/a.pdf');
const mockShareAsync = jest.fn().mockResolvedValue(undefined);
const mockIsAvailableAsync = jest.fn().mockResolvedValue(true);

jest.mock('expo-intent-launcher', () => ({
  startActivityAsync: (...a: unknown[]) => mockStartActivityAsync(...a),
}));
jest.mock('expo-file-system/legacy', () => ({
  getContentUriAsync: (...a: unknown[]) => mockGetContentUriAsync(...a),
}));
jest.mock('expo-sharing', () => ({
  isAvailableAsync: () => mockIsAvailableAsync(),
  shareAsync: (...a: unknown[]) => mockShareAsync(...a),
}));

import { Platform } from 'react-native';
import { openPdf } from './openPdf';

beforeEach(() => jest.clearAllMocks());

// Regressão: os PDFs do app abriam na folha de COMPARTILHAMENTO ("enviar/imprimir")
// em vez do visualizador, porque usavam Sharing.shareAsync (ACTION_SEND) no Android.
// O correto é ACTION_VIEW com content:// — file:// lança FileUriExposedException
// desde o Android 7, e sem a flag 1 o leitor não consegue ler o arquivo.
describe('openPdf no Android', () => {
  beforeAll(() => {
    Platform.OS = 'android';
  });

  it('abre no visualizador com ACTION_VIEW, content:// e permissão de leitura', async () => {
    await openPdf('file:///cache/carteirinha.pdf');

    expect(mockGetContentUriAsync).toHaveBeenCalledWith('file:///cache/carteirinha.pdf');
    expect(mockStartActivityAsync).toHaveBeenCalledWith('android.intent.action.VIEW', {
      data: 'content://br.org.copvasf/cache/a.pdf',
      flags: 1,
      type: 'application/pdf',
    });
    expect(mockShareAsync).not.toHaveBeenCalled();
  });

  it('sem visualizador instalado, cai para a folha de compartilhamento', async () => {
    mockStartActivityAsync.mockRejectedValueOnce(new Error('No Activity found to handle Intent'));

    await openPdf('file:///cache/carteirinha.pdf');

    expect(mockShareAsync).toHaveBeenCalledWith(
      'file:///cache/carteirinha.pdf',
      expect.objectContaining({ mimeType: 'application/pdf' }),
    );
  });
});

describe('openPdf no iOS', () => {
  beforeAll(() => {
    Platform.OS = 'ios';
  });

  it('usa a folha de compartilhamento — no iOS não existe "abrir com"', async () => {
    await openPdf('file:///cache/carteirinha.pdf');

    expect(mockStartActivityAsync).not.toHaveBeenCalled();
    expect(mockShareAsync).toHaveBeenCalled();
  });
});
