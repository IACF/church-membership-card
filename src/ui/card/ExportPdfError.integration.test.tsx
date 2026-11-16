import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import ExportPdfButton from './ExportPdfButton';
import { memberFixture } from '@/model/member.fixture';
import { exportCardPdf } from '@/lib/pdf/exportCard';

// Caminho REAL: botão → useExportCard → exportCardPdf (só o módulo nativo é mockado).
//
// O detalhe técnico chega à tela NO DESENVOLVIMENTO, onde serve para diagnosticar
// falhas que só acontecem no APK. Em produção ele não aparece: rastro de exceção
// não diz nada ao membro e pega mal na revisão da loja. O console.error de
// exportCard.ts continua levando tudo ao log nativo nos dois casos.
jest.mock('@/lib/pdf/exportCard', () => ({
  exportCardPdf: jest.fn(),
}));
const mockExport = exportCardPdf as jest.Mock;

describe('Exportar PDF — o detalhe da falha chega à tela', () => {
  const DEV_ORIGINAL = __DEV__;
  afterEach(() => {
    (globalThis as unknown as { __DEV__: boolean }).__DEV__ = DEV_ORIGINAL;
  });

  it('em desenvolvimento, renderiza a mensagem amigável E o detalhe técnico', async () => {
    (globalThis as unknown as { __DEV__: boolean }).__DEV__ = true;
    mockExport.mockRejectedValueOnce({
      kind: 'unknown',
      message: 'Algo deu errado. Tente novamente.',
      detail: '[print] Error: WebView render failed',
    });

    render(<ExportPdfButton member={memberFixture} />);
    fireEvent.press(screen.getByTestId('export-pdf'));

    await waitFor(() => {
      expect(screen.getByTestId('export-error')).toHaveTextContent(
        'Algo deu errado. Tente novamente.',
      );
    });
    expect(screen.getByTestId('export-error-detail')).toHaveTextContent(
      '[print] Error: WebView render failed',
    );
  });

  it('em produção, mostra só a mensagem amigável — sem rastro de exceção', async () => {
    (globalThis as unknown as { __DEV__: boolean }).__DEV__ = false;
    mockExport.mockRejectedValueOnce({
      kind: 'unknown',
      message: 'Algo deu errado. Tente novamente.',
      detail: '[assets] java.lang.IllegalArgumentException: URI is not absolute',
    });

    render(<ExportPdfButton member={memberFixture} />);
    fireEvent.press(screen.getByTestId('export-pdf'));

    await waitFor(() => {
      expect(screen.getByTestId('export-error')).toHaveTextContent(
        'Algo deu errado. Tente novamente.',
      );
    });
    expect(screen.queryByTestId('export-error-detail')).toBeNull();
    expect(screen.queryByText(/IllegalArgumentException/)).toBeNull();
  });
});
