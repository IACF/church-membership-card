import type { Member } from '@/model/member';
import { buildCardHtml, type CardAssets } from './cardHtml';

const member: Member = {
  nomeCompleto: 'Lucas de Souza Conceição',
  cpf: '11144477735',
  registro: '2024003',
  whatsapp: '87999998888',
  funcao: 'Pastor',
  cargo: 'Secretário Geral',
  cnpj: '66.551.138/0001-97',
  igreja: 'Assembleia de Deus Ministério Logos',
  nomePai: 'Raimundo Marques da Conceição',
  nomeMae: 'Maria Janete de Souza Conceição',
  filiacao: 'Raimundo Marques e Maria Janete',
  nascimento: '1993-07-19',
  estadoCivil: 'Casado(a)',
  inadimplente: false,
  presidente: 'José Humberto S. Santos',
  secretario: 'Lucas de Souza Conceição',
};

const assets: CardAssets = {
  brasao: 'data:image/png;base64,BRASAO',
  logo: 'data:image/png;base64,LOGO',
  assinaturaPresidente: 'data:image/png;base64,SIGP',
  assinaturaSecretario: 'data:image/png;base64,SIGS',
  photo: 'data:image/jpeg;base64,PHOTO',
};

const qrSvg = '<svg id="qr"></svg>';

describe('buildCardHtml', () => {
  const html = buildCardHtml(member, assets, qrSvg);

  it('inclui os dados do membro (frente)', () => {
    expect(html).toContain('Lucas de Souza Conceição');
    expect(html).toContain('2024003');
    expect(html).toContain('Assembleia de Deus Ministério Logos');
  });

  it('combina função e cargo como na tela (funcao - cargo)', () => {
    expect(html).toContain('Pastor - Secretário Geral');
  });

  it('exibe o CNPJ no rodapé da frente', () => {
    expect(html).toContain('CNPJ: 66.551.138/0001-97');
  });

  it('formata CPF e data como na tela', () => {
    expect(html).toContain('111.444.777-35');
    expect(html).toContain('19/07/1993');
  });

  it('inclui presidente/secretário com os cargos', () => {
    expect(html).toContain('José Humberto S. Santos');
    expect(html).toContain('Presidente do COPVASF');
    expect(html).toContain('Secretário Geral do COPVASF');
  });

  it('embute os assets (brasão, logo, 2 assinaturas, foto) como data URI', () => {
    expect(html).toContain('data:image/png;base64,BRASAO');
    expect(html).toContain('data:image/png;base64,LOGO');
    expect(html).toContain('data:image/png;base64,SIGP');
    expect(html).toContain('data:image/png;base64,SIGS');
    expect(html).toContain('data:image/jpeg;base64,PHOTO');
  });

  it('inclui o QR e o rótulo AUTENTICIDADE (só no PDF)', () => {
    expect(html).toContain('<svg id="qr"></svg>');
    expect(html).toContain('AUTENTICIDADE');
  });

  it('desenha a faixa preta (SVG com gradiente)', () => {
    expect(html).toContain('linearGradient');
    expect(html).toContain('stripBase-front');
    expect(html).toContain('stripBase-back');
  });

  it('não reintroduz o campo "Validade"', () => {
    expect(html).not.toMatch(/Validade/i);
  });

  it('sem foto → usa o placeholder (sem <img> de foto)', () => {
    const semFoto = buildCardHtml(
      { ...member, photoUrl: undefined },
      { ...assets, photo: undefined },
      qrSvg,
    );
    expect(semFoto).toContain('photo-ph');
    expect(semFoto).not.toContain('data:image/jpeg;base64,PHOTO');
  });

  it('membro adimplente → sem tarja; inadimplente → tarja "INADIMPLENTE"', () => {
    expect(html).not.toContain('INADIMPLENTE');
    const inadimplente = buildCardHtml({ ...member, inadimplente: true }, assets, qrSvg);
    expect(inadimplente).toContain('INADIMPLENTE');
    expect(inadimplente).toContain('class="tarja"');
  });

  it('escapa caracteres HTML de nomes (evita quebra/injeção)', () => {
    const html2 = buildCardHtml({ ...member, nomeCompleto: 'A & <b> "x"' }, assets, qrSvg);
    expect(html2).toContain('A &amp; &lt;b&gt; &quot;x&quot;');
  });
});
