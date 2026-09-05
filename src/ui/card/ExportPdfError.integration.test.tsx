import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import ExportPdfButton from './ExportPdfButton';
import { memberFixture } from '@/model/member.fixture';
import { exportCardPdf } from '@/lib/pdf/exportCard';

// Caminho REAL: botão → useExportCard → exportCardPdf (só o módulo nativo é mockado).
// Prova que o detalhe técnico da falha chega até a tela — sem isso o usuário vê
// apenas "Algo deu errado" e a falha fica indiagnosticável em produção.
jest.mock('@/lib/pdf/exportCard', () => ({
  exportCardPdf: jest.fn(),
}));
const mockExport = exportCardPdf as jest.Mock;

describe('Exportar PDF — o detalhe da falha chega à tela', () => {
  it('renderiza a mensagem amigável E o detalhe técnico da etapa', async () => {
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
});
