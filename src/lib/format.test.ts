import { formatCpf, formatDate, formatPhone } from './format';

describe('formatCpf', () => {
  it('formata 11 dígitos como CPF', () => {
    expect(formatCpf('52998224725')).toBe('529.982.247-25');
  });
  it('devolve o original quando não tem 11 dígitos', () => {
    expect(formatCpf('123')).toBe('123');
  });
});

describe('formatDate', () => {
  it('converte YYYY-MM-DD em dd/mm/aaaa', () => {
    expect(formatDate('1993-07-19')).toBe('19/07/1993');
  });
  it('aceita ISO completo (usa só a data)', () => {
    expect(formatDate('1993-07-19T00:00:00.000Z')).toBe('19/07/1993');
  });
  it('devolve o original quando não casa o padrão', () => {
    expect(formatDate('19/07/1993')).toBe('19/07/1993');
  });
});

describe('formatPhone', () => {
  it('formata celular (11 dígitos)', () => {
    expect(formatPhone('87999998888')).toBe('(87) 99999-8888');
  });
  it('formata fixo (10 dígitos)', () => {
    expect(formatPhone('8733334444')).toBe('(87) 3333-4444');
  });
  it('devolve o original quando não casa', () => {
    expect(formatPhone('123')).toBe('123');
  });
});
