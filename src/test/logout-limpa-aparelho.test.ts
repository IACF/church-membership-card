import AsyncStorage from '@react-native-async-storage/async-storage';
import { dehydrate } from '@tanstack/react-query';
import { persister, queryClient } from '@/lib/queryClient';
import { loadSession } from '@/session/session.storage';
import { useSessionStore } from '@/session/session.store';

// Sair do app tem de apagar TUDO o que ficou do membro no aparelho.
//
// O token vive no armazenamento cifrado do sistema, mas o cache do React Query
// vive no AsyncStorage, que NÃO é cifrado, e guarda a query ['me'] inteira — com
// CPF, filiação e igreja. Com gcTime de 7 dias, esquecer de limpá-lo deixava o
// dado pessoal legível por uma semana num aparelho compartilhado.
//
// A política de privacidade declara que sair apaga os dados do aparelho; este
// teste é o que sustenta a declaração.

const CPF = '52998224725';

const MEMBRO = {
  id: 'abc123',
  nome: 'Fulano',
  sobrenome: 'de Teste',
  cpf: CPF,
  registro: '202600099',
  nomeMae: 'Mãe de Teste',
  igreja: 'Igreja de Teste',
};

async function dumpDoAparelho(): Promise<string> {
  const chaves = await AsyncStorage.getAllKeys();
  const pares = await AsyncStorage.multiGet([...chaves]);
  return pares.map(([, valor]) => valor ?? '').join('\n');
}

describe('sair do app apaga os dados do aparelho', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    queryClient.clear();
    await useSessionStore.getState().setSession({
      token: 'jwt-de-teste',
      member: { id: MEMBRO.id, nome: MEMBRO.nome },
      mustChangePassword: false,
    } as never);
  });

  it('remove o cache persistido com dado pessoal, e não só o token', async () => {
    // Simula o que o PersistQueryClientProvider faz em produção: grava no
    // AsyncStorage o cache desidratado, que inclui a carteirinha do membro.
    queryClient.setQueryData(['me'], MEMBRO);
    await persister.persistClient({
      buster: '',
      timestamp: Date.now(),
      clientState: dehydrate(queryClient),
    });

    // Pré-condição: o CPF está mesmo gravado em claro no aparelho.
    expect(await dumpDoAparelho()).toContain(CPF);

    await useSessionStore.getState().clear();

    // Token: fora do armazenamento cifrado.
    expect(await loadSession()).toBeNull();
    // Cache em memória: zerado.
    expect(queryClient.getQueryData(['me'])).toBeUndefined();
    // Cache em disco: nenhum resquício do dado pessoal.
    expect(await dumpDoAparelho()).not.toContain(CPF);
  });

  it('deixa o estado da sessão zerado', async () => {
    await useSessionStore.getState().clear();
    const s = useSessionStore.getState();
    expect(s.token).toBeNull();
    expect(s.member).toBeNull();
    expect(s.isAuthenticated).toBe(false);
  });
});
