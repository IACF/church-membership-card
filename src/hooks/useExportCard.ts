import { useCallback, useState } from 'react';
import type { Member } from '@/model/member';
import { type AppError, toAppError } from '@/model/errors';
import { exportCardPdf } from '@/lib/pdf/exportCard';

// Estado da exportação do PDF da carteirinha para a UI: `isExporting` (spinner/
// disabled no botão) e `error` (mensagem amigável). `exportCard` dispara o fluxo.
export function useExportCard(member: Member | undefined) {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  const exportCard = useCallback(async () => {
    if (!member || isExporting) return;
    setError(null);
    setIsExporting(true);
    try {
      await exportCardPdf(member);
    } catch (e) {
      setError(toAppError(e));
    } finally {
      setIsExporting(false);
    }
  }, [member, isExporting]);

  return { isExporting, error, exportCard };
}
