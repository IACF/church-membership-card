import { render, screen } from '@testing-library/react-native';
import CardBack from './CardBack';
import { memberFixture } from '@/model/member.fixture';
import type { Member } from '@/model/member';

// Nome, cargo e imagem das assinaturas vêm da CONFIGURAÇÃO do servidor, para que
// trocar a diretoria não exija gerar APK (spec `assinaturas-conselho`). Estes
// testes travam isso — e travam o fallback, que é o que impede cartão em branco
// quando o servidor ainda não foi configurado.
const comAssinaturas = (assinaturas: Member['assinaturas']): Member => ({
  ...memberFixture,
  assinaturas,
});

describe('CardBack — assinaturas por configuração', () => {
  it('exibe nome e cargo vindos da configuração', () => {
    render(
      <CardBack
        member={comAssinaturas([
          { nome: 'José Humberto S. Santos', cargo: 'Presidente do COPVASF' },
          { nome: 'Luide Carlos Silva Santana', cargo: 'Vice-presidente' },
        ])}
      />,
    );

    expect(screen.getByText('Luide Carlos Silva Santana')).toBeOnTheScreen();
    expect(screen.getByText('Vice-presidente')).toBeOnTheScreen();
  });

  it('usa a imagem configurada quando há imagemUrl', () => {
    const url = 'https://copvasf.com.br/uploads/signatures/vice.png?v=1';
    render(
      <CardBack
        member={comAssinaturas([
          { nome: 'A', cargo: 'Presidente do COPVASF' },
          { nome: 'B', cargo: 'Vice-presidente', imagemUrl: url },
        ])}
      />,
    );

    expect(screen.getByTestId('sig-secretario').props.source).toEqual({ uri: url });
  });

  it('sem imagemUrl, cai para a imagem empacotada (não fica em branco)', () => {
    render(
      <CardBack
        member={comAssinaturas([
          { nome: 'A', cargo: 'Presidente do COPVASF' },
          { nome: 'B', cargo: 'Vice-presidente' },
        ])}
      />,
    );

    // O asset empacotado é um módulo do bundler (número/objeto), nunca um { uri }.
    expect(screen.getByTestId('sig-secretario').props.source).not.toHaveProperty('uri');
  });

  it('servidor antigo (sem o campo): usa os campos legados e não quebra', () => {
    const legado = { ...memberFixture } as Member;
    // @ts-expect-error — simula resposta de uma API anterior a esta feature
    delete legado.assinaturas;

    render(<CardBack member={legado} />);

    expect(screen.getByText(memberFixture.presidente)).toBeOnTheScreen();
    expect(screen.getByText('Presidente do COPVASF')).toBeOnTheScreen();
  });
});
