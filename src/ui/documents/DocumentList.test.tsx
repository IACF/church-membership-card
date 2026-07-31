import { fireEvent, render, screen } from '@testing-library/react-native';
import { Linking } from 'react-native';
import DocumentList from './DocumentList';
import { useDocuments } from '@/hooks/useDocuments';

jest.mock('@/hooks/useDocuments');

const mockUseDocuments = useDocuments as jest.Mock;

const doc = {
  id: 'doc1',
  title: 'Estatuto do COPVASF',
  description: 'Versão vigente',
  location: 'documentos',
  fileUrl: 'https://api.copvasf.org.br/uploads/documents/abc.pdf?v=1',
  fileName: 'estatuto.pdf',
  fileSize: 1234,
  createdAt: '2026-07-28T00:00:00.000Z',
  updatedAt: '2026-07-28T00:00:00.000Z',
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('DocumentList', () => {
  it('passa o location recebido ao hook', () => {
    mockUseDocuments.mockReturnValue({ data: [], isLoading: false, isError: false });
    render(<DocumentList location="informacoes-conselho" />);
    expect(mockUseDocuments).toHaveBeenCalledWith('informacoes-conselho');
  });

  it('renderiza os documentos e abre o PDF ao tocar', () => {
    const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true as never);
    mockUseDocuments.mockReturnValue({ data: [doc], isLoading: false, isError: false });

    render(<DocumentList location="documentos" />);
    expect(screen.getByText('Estatuto do COPVASF')).toBeOnTheScreen();
    expect(screen.getByText('Versão vigente')).toBeOnTheScreen();

    fireEvent.press(screen.getByTestId('document-doc1'));
    expect(openURL).toHaveBeenCalledWith(doc.fileUrl);
  });

  it('mostra o estado vazio quando não há documentos', () => {
    mockUseDocuments.mockReturnValue({ data: [], isLoading: false, isError: false });
    render(<DocumentList location="documentos" />);
    expect(screen.getByText('Nenhum documento disponível')).toBeOnTheScreen();
  });

  it('mostra mensagem de erro e permite tentar novamente', () => {
    const refetch = jest.fn();
    mockUseDocuments.mockReturnValue({ isLoading: false, isError: true, refetch });
    render(<DocumentList location="documentos" />);
    expect(screen.getByText('Não foi possível carregar os documentos.')).toBeOnTheScreen();
    fireEvent.press(screen.getByTestId('documents-retry'));
    expect(refetch).toHaveBeenCalled();
  });
});
