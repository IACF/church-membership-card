import { fireEvent, render, screen } from '@testing-library/react-native';
import ExportPdfButton from './ExportPdfButton';
import { useExportCard } from '@/hooks/useExportCard';
import { memberFixture } from '@/model/member.fixture';

jest.mock('@/hooks/useExportCard');
const mockUse = useExportCard as jest.Mock;

beforeEach(() => jest.clearAllMocks());

describe('ExportPdfButton', () => {
  it('mostra o rótulo e dispara exportCard ao tocar', () => {
    const exportCard = jest.fn();
    mockUse.mockReturnValue({ isExporting: false, error: null, exportCard });

    render(<ExportPdfButton member={memberFixture} />);
    expect(screen.getByText('Exportar PDF')).toBeOnTheScreen();

    fireEvent.press(screen.getByTestId('export-pdf'));
    expect(exportCard).toHaveBeenCalledTimes(1);
  });

  it('durante a exportação: sem rótulo (spinner) e botão desabilitado', () => {
    const exportCard = jest.fn();
    mockUse.mockReturnValue({ isExporting: true, error: null, exportCard });

    render(<ExportPdfButton member={memberFixture} />);
    expect(screen.queryByText('Exportar PDF')).toBeNull();

    fireEvent.press(screen.getByTestId('export-pdf'));
    expect(exportCard).not.toHaveBeenCalled();
  });

  it('exibe a mensagem de erro quando há falha', () => {
    mockUse.mockReturnValue({
      isExporting: false,
      error: { kind: 'unknown', message: 'Algo deu errado. Tente novamente.' },
      exportCard: jest.fn(),
    });

    render(<ExportPdfButton member={memberFixture} />);
    expect(screen.getByTestId('export-error')).toHaveTextContent(
      'Algo deu errado. Tente novamente.',
    );
  });
});
