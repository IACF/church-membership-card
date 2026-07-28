import { resolveRedirect } from './route-guard';

describe('resolveRedirect (guard de sessão)', () => {
  it('não autenticado fora do login → manda para o login', () => {
    expect(
      resolveRedirect(
        { isAuthenticated: false, mustChangePassword: false },
        ['(app)'],
      ),
    ).toBe('/(auth)/login');
  });

  it('não autenticado já no login → não redireciona', () => {
    expect(
      resolveRedirect({ isAuthenticated: false, mustChangePassword: false }, [
        '(auth)',
        'login',
      ]),
    ).toBeNull();
  });

  it('autenticado com mustChangePassword → força a troca de senha', () => {
    expect(
      resolveRedirect({ isAuthenticated: true, mustChangePassword: true }, [
        '(app)',
      ]),
    ).toBe('/(auth)/change-password');
  });

  it('autenticado na troca obrigatória → não redireciona', () => {
    expect(
      resolveRedirect({ isAuthenticated: true, mustChangePassword: true }, [
        '(auth)',
        'change-password',
      ]),
    ).toBeNull();
  });

  it('autenticado sem troca, fora do app → vai para o app', () => {
    expect(
      resolveRedirect({ isAuthenticated: true, mustChangePassword: false }, [
        '(auth)',
        'login',
      ]),
    ).toBe('/(app)');
  });

  it('autenticado sem troca, já no app → não redireciona', () => {
    expect(
      resolveRedirect({ isAuthenticated: true, mustChangePassword: false }, [
        '(app)',
      ]),
    ).toBeNull();
  });
});
