import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import ConsentimentosScreen from '../../../app/(app)/consentimentos';
import * as memberApi from '@/api/member.api';
import { useMember } from '@/hooks/useMember';

jest.mock('@/hooks/useMember');
jest.mock('@/api/member.api', () => ({
  ...jest.requireActual('@/api/member.api'),
  putConsentimentos: jest.fn(),
}));

function comEstado(estado: 'pendente' | 'concedido' | 'revogado', extra = {}) {
  (useMember as jest.Mock).mockReturnValue({
    isPending: false,
    data: {
      nomeCompleto: 'Fulano Teste',
      consentimentos: {
        transferenciaInternacional: { estado, ...extra },
        versaoVigente: '2026-11-15',
      },
    },
  });
}

// gcTime 0 e clear() no fim: sem isso o React Query deixa temporizador vivo e o
// jest não encerra o processo.
let client: QueryClient;

function renderizar() {
  client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return render(
    <QueryClientProvider client={client}>
      <ConsentimentosScreen />
    </QueryClientProvider>,
  );
}

beforeEach(() => jest.clearAllMocks());
afterEach(() => client?.clear());

describe('Tela de consentimentos', () => {
  it('não vem pré-marcada para quem nunca se manifestou', () => {
    comEstado('pendente');
    renderizar();

    // Caixa pré-marcada transformaria "não fiz nada" em "concordei".
    expect(screen.getByTestId('consent-transferencia').props.value).toBe(false);
    expect(screen.getByTestId('consent-estado')).toHaveTextContent('Ainda não manifestado');
  });

  it('nomeia o país de destino — exigência de informação prévia', () => {
    comEstado('pendente');
    renderizar();
    expect(screen.getByText(/Estados Unidos da América/)).toBeOnTheScreen();
  });

  it('reflete o consentimento já concedido', () => {
    comEstado('concedido', { concedidoEm: '2026-11-10T12:00:00.000Z' });
    renderizar();
    expect(screen.getByTestId('consent-transferencia').props.value).toBe(true);
    expect(screen.getByTestId('consent-estado')).toHaveTextContent(/10\/11\/2026/);
  });

  it('só envia depois de salvar, e manda o valor escolhido', async () => {
    comEstado('pendente');
    (memberApi.putConsentimentos as jest.Mock).mockResolvedValue({});
    renderizar();

    fireEvent(screen.getByTestId('consent-transferencia'), 'valueChange', true);
    // Mexer na chave não grava nada: a escrita é explícita.
    expect(memberApi.putConsentimentos).not.toHaveBeenCalled();

    fireEvent.press(screen.getByTestId('salvar-consentimentos'));

    await waitFor(() =>
      expect(memberApi.putConsentimentos).toHaveBeenCalledWith({
        transferenciaInternacional: true,
      }),
    );
  });

  it('confirma antes de revogar', () => {
    const alerta = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    comEstado('concedido', { concedidoEm: '2026-11-10T12:00:00.000Z' });
    renderizar();

    fireEvent(screen.getByTestId('consent-transferencia'), 'valueChange', false);
    fireEvent.press(screen.getByTestId('salvar-consentimentos'));

    expect(alerta).toHaveBeenCalled();
    expect(String(alerta.mock.calls[0][0])).toMatch(/Revogar/);
    // Nada é enviado enquanto a confirmação não for aceita.
    expect(memberApi.putConsentimentos).not.toHaveBeenCalled();
    alerta.mockRestore();
  });
});
