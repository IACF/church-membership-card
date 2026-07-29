import { useSessionStore } from './session.store';

const sample = {
  token: 't',
  member: { id: 'm', nomeCompleto: 'Nome Teste', registro: 'REG-1' },
  mustChangePassword: false,
};

function reset() {
  useSessionStore.setState({
    token: null,
    member: null,
    mustChangePassword: false,
    isAuthenticated: false,
    hydrated: false,
  });
}

beforeEach(reset);

describe('session store', () => {
  it('hydrate: restaura a sessão persistida (app reaberto)', async () => {
    await useSessionStore.getState().setSession(sample);
    // simula reabrir o app: zera memória, mantém o storage
    useSessionStore.setState({
      token: null,
      member: null,
      isAuthenticated: false,
      hydrated: false,
    });

    await useSessionStore.getState().hydrate();

    const s = useSessionStore.getState();
    expect(s.isAuthenticated).toBe(true);
    expect(s.token).toBe('t');
    expect(s.hydrated).toBe(true);
  });

  it('hydrate sem sessão: apenas marca hydrated', async () => {
    await useSessionStore.getState().clear();
    await useSessionStore.getState().hydrate();
    const s = useSessionStore.getState();
    expect(s.isAuthenticated).toBe(false);
    expect(s.hydrated).toBe(true);
  });

  it('markPasswordChanged: zera mustChangePassword e persiste', async () => {
    await useSessionStore.getState().setSession({ ...sample, mustChangePassword: true });

    await useSessionStore.getState().markPasswordChanged();

    expect(useSessionStore.getState().mustChangePassword).toBe(false);
    // persistiu: reidratar não traz a obrigatoriedade de volta
    useSessionStore.setState({ hydrated: false });
    await useSessionStore.getState().hydrate();
    expect(useSessionStore.getState().mustChangePassword).toBe(false);
  });

  it('clear: limpa store e storage (logout)', async () => {
    await useSessionStore.getState().setSession(sample);
    await useSessionStore.getState().clear();

    expect(useSessionStore.getState().isAuthenticated).toBe(false);
    // storage vazio: nova hidratação não restaura
    useSessionStore.setState({ hydrated: false });
    await useSessionStore.getState().hydrate();
    expect(useSessionStore.getState().isAuthenticated).toBe(false);
  });
});
