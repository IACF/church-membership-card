import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useExportCard } from './useExportCard';
import { exportCardPdf } from '@/lib/pdf/exportCard';
import { memberFixture } from '@/model/member.fixture';

jest.mock('@/lib/pdf/exportCard');
const mockExport = exportCardPdf as jest.Mock;

beforeEach(() => jest.clearAllMocks());

describe('useExportCard', () => {
  it('alterna isExporting durante a exportação e chama exportCardPdf com o membro', async () => {
    let resolve!: () => void;
    mockExport.mockReturnValue(new Promise<void>((r) => (resolve = r)));
    const { result } = renderHook(() => useExportCard(memberFixture));

    expect(result.current.isExporting).toBe(false);
    act(() => void result.current.exportCard());
    await waitFor(() => expect(result.current.isExporting).toBe(true));

    await act(async () => resolve());
    await waitFor(() => expect(result.current.isExporting).toBe(false));
    expect(mockExport).toHaveBeenCalledWith(memberFixture);
    expect(result.current.error).toBeNull();
  });

  it('captura falha em error (AppError) e volta isExporting a false', async () => {
    mockExport.mockRejectedValue({ kind: 'unknown', message: 'Algo deu errado. Tente novamente.' });
    const { result } = renderHook(() => useExportCard(memberFixture));

    await act(async () => {
      await result.current.exportCard();
    });

    expect(result.current.isExporting).toBe(false);
    expect(result.current.error?.message).toBe('Algo deu errado. Tente novamente.');
  });

  it('sem membro → não dispara exportação', async () => {
    const { result } = renderHook(() => useExportCard(undefined));
    await act(async () => {
      await result.current.exportCard();
    });
    expect(mockExport).not.toHaveBeenCalled();
  });
});
