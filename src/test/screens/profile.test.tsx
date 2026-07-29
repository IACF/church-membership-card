import { fireEvent, render, screen } from '@testing-library/react-native';
import * as expoRouter from 'expo-router';
import ProfileScreen from '../../../app/(app)/profile';
import { useMember } from '@/hooks/useMember';

jest.mock('expo-router', () => ({ useRouter: jest.fn() }));
jest.mock('@/hooks/useMember');

const push = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (expoRouter.useRouter as jest.Mock).mockReturnValue({ push });
  (useMember as jest.Mock).mockReturnValue({
    isPending: false,
    isError: false,
    data: {
      nomeCompleto: 'Fulano Teste',
      registro: 'REG-1',
      funcao: 'Pastor',
      igreja: 'Central',
      filiacao: 'Pai e Mae',
      cpf: '52998224725',
      nascimento: '1990-05-20',
      estadoCivil: 'Casado(a)',
      whatsapp: '87999998888',
    },
  });
});

describe('ProfileScreen', () => {
  it('exibe os dados do membro com CPF/data/WhatsApp formatados', () => {
    render(<ProfileScreen />);
    expect(screen.getByText('Fulano Teste')).toBeOnTheScreen();
    expect(screen.getByText('529.982.247-25')).toBeOnTheScreen();
    expect(screen.getByText('20/05/1990')).toBeOnTheScreen();
    expect(screen.getByText('(87) 99999-8888')).toBeOnTheScreen();
  });

  it('o botão Alterar senha navega para a troca de senha', () => {
    render(<ProfileScreen />);
    fireEvent.press(screen.getByTestId('change-password'));
    expect(push).toHaveBeenCalledWith('/(app)/change-password');
  });

  it('exibe "Em dia" quando o membro não é inadimplente', () => {
    render(<ProfileScreen />);
    expect(screen.getByText('Situação')).toBeOnTheScreen();
    expect(screen.getByText('Em dia')).toBeOnTheScreen();
  });

  it('exibe "Inadimplente" quando o membro está inadimplente', () => {
    (useMember as jest.Mock).mockReturnValue({
      isPending: false,
      isError: false,
      data: {
        nomeCompleto: 'Fulano Teste',
        registro: 'REG-1',
        funcao: 'Pastor',
        igreja: 'Central',
        filiacao: 'Pai e Mae',
        cpf: '52998224725',
        nascimento: '1990-05-20',
        estadoCivil: 'Casado(a)',
        whatsapp: '87999998888',
        inadimplente: true,
      },
    });
    render(<ProfileScreen />);
    expect(screen.getByText('Inadimplente')).toBeOnTheScreen();
  });
});
