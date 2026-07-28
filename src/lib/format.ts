// Formatações de apresentação da carteirinha.

// '52998224725' → '529.982.247-25' (retorna o original se não tiver 11 dígitos).
export function formatCpf(cpf: string): string {
  const d = (cpf ?? '').replace(/\D/g, '');
  if (d.length !== 11) return cpf ?? '';
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

// '1993-07-19' → '19/07/1993' (retorna o original se não casar o padrão).
export function formatDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso ?? '');
  return m ? `${m[3]}/${m[2]}/${m[1]}` : (iso ?? '');
}
