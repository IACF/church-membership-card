import type { Member } from '@/model/member';
import { formatCpf, formatDate } from '@/lib/format';
import { fitCargoFontSize } from '@/ui/card/cardBase';

// Assets do PDF resolvidos como data URI base64 (ver assets.ts). A foto é
// opcional: ausente → placeholder (mesma caixa 👤 do PhotoPlaceholder).
export type CardAssets = {
  brasao: string;
  logo: string;
  assinaturaPresidente: string;
  assinaturaSecretario: string;
  photo?: string;
};

// Escapa texto do membro para HTML (nomes podem conter &, <, aspas, etc.).
function esc(value: string | undefined): string {
  return (value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Faixa preta lateral (SVG inline) — replica LeftStrip.tsx para h=215.
// `suffix` garante ids de gradiente únicos entre a frente e o verso.
function leftStrip(suffix: string): string {
  const baseId = `stripBase-${suffix}`;
  const sheenId = `stripSheen-${suffix}`;
  const base = 'M 0 0 L 36 0 C 46 68.8 84 111.8 70 215 L 0 215 Z';
  const sheen = 'M 36 0 C 46 68.8 84 111.8 70 215 L 54 215 C 64 111.8 32 68.8 20 0 Z';
  return `<svg class="strip" width="120" height="215" viewBox="0 0 120 215">
    <defs>
      <linearGradient id="${baseId}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#000000" />
        <stop offset="0.55" stop-color="#0e1424" />
        <stop offset="1" stop-color="#20293f" />
      </linearGradient>
      <linearGradient id="${sheenId}" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#2b3550" />
        <stop offset="1" stop-color="#4a5a7a" />
      </linearGradient>
    </defs>
    <path d="${base}" fill="url(#${baseId})" />
    <path d="${sheen}" fill="url(#${sheenId})" opacity="0.55" />
  </svg>`;
}

// Tarja de inadimplência (véu + faixa diagonal) — replica DelinquencyBanner.tsx.
function tarja(): string {
  return `<div class="tarja">
    <div class="veil"></div>
    <div class="band">INADIMPLENTE</div>
  </div>`;
}

function photoFront(assets: CardAssets): string {
  if (assets.photo) {
    return `<img class="photo-img" src="${assets.photo}" alt="" />`;
  }
  return `<div class="photo-ph">👤</div>`;
}

function field(label: string, value: string, lines = 1): string {
  const valueClass = lines > 1 ? 'f-value f-value--multi' : 'f-value';
  return `<div class="field">
    <div class="f-label">${esc(label)}</div>
    <div class="${valueClass}">${esc(value)}</div>
  </div>`;
}

function front(member: Member, assets: CardAssets, qrSvg: string): string {
  // Função/Cargo combinados (como no CardFront): "funcao - cargo" quando há cargo.
  // Fonte diminui p/ caber em 2 linhas (fitCargoFontSize) — mesmo cálculo da tela.
  const funcaoCargo = member.cargo ? `${member.funcao} - ${member.cargo}` : member.funcao;
  const fcFont = fitCargoFontSize(funcaoCargo);
  return `<div class="card">
    ${leftStrip('front')}
    <div class="photo-wrap">${photoFront(assets)}</div>
    <img class="brasao" src="${assets.brasao}" alt="" />
    <div class="header">
      <div class="title-main">CONSELHO DE PASTORES</div>
      <div class="title-sub">Do Vale do São Francisco</div>
    </div>
    <img class="logo" src="${assets.logo}" alt="" />
    <div class="content-front">
      ${field('Nome:', member.nomeCompleto)}
      <div class="field">
        <div class="f-label">Função/Cargo:</div>
        <div class="f-value fc-value" style="font-size:${fcFont}px;line-height:${fcFont + 2}px">${esc(funcaoCargo)}</div>
      </div>
      ${field('Registro:', member.registro)}
      ${field('Igreja:', member.igreja, 2)}
      <div class="front-footer">
        <div class="versiculo">"Um ao outro ajudou e ao seu companheiro disse: Esforça-te! (Is 41.6)"</div>
        ${member.cnpj ? `<div class="cnpj">CNPJ: ${esc(member.cnpj)}</div>` : ''}
      </div>
    </div>
    <div class="qr-wrap">
      <div class="qr">${qrSvg}</div>
      <!-- Rótulo como texto SVG (não como texto HTML): imune ao "font boosting" do
           WebView mobile, que inflava o texto e o cortava. O viewBox largo com
           text-anchor middle garante que o texto nunca estoure a borda. -->
      <svg class="qr-label" width="54" height="8" viewBox="0 0 96 12" preserveAspectRatio="xMidYMid meet">
        <text x="48" y="9" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="8" font-weight="700" letter-spacing="0.4" fill="#64748b">AUTENTICIDADE</text>
      </svg>
    </div>
    ${member.inadimplente ? tarja() : ''}
  </div>`;
}

function gridField(label: string, value: string): string {
  return `<div class="grid-cell">
    <div class="f-label">${esc(label)}</div>
    <div class="f-value-b">${esc(value)}</div>
  </div>`;
}

function signature(name: string, role: string, sig: string): string {
  return `<div class="sig">
    <img class="sig-img" src="${sig}" alt="" />
    <div class="sig-line"></div>
    <div class="sig-name">${esc(name)}</div>
    <div class="sig-role">${esc(role)}</div>
  </div>`;
}

function back(member: Member, assets: CardAssets): string {
  const filiacao = member.nomePai
    ? `<div class="f-value-b">${esc(member.nomePai)}</div><div class="f-value-b">${esc(member.nomeMae)}</div>`
    : `<div class="f-value-b">${esc(member.nomeMae)}</div>`;
  return `<div class="card">
    ${leftStrip('back')}
    <div class="content-back">
      <div class="field-wide">
        <div class="f-label">Filiação:</div>
        ${filiacao}
      </div>
      <div class="grid">
        ${gridField('CPF:', formatCpf(member.cpf))}
        ${gridField('Nascimento:', formatDate(member.nascimento))}
        ${gridField('Estado Civil:', member.estadoCivil)}
      </div>
      <div class="sig-row">
        ${signature(member.presidente, 'Presidente do COPVASF', assets.assinaturaPresidente)}
        ${signature(member.secretario, 'Secretário Geral do COPVASF', assets.assinaturaSecretario)}
      </div>
      <div class="legal">O portador da presente, está apto a exercer suas atribuições como Capelão Eclesiástico de acordo com o Art. 5º, Inciso VII da CF e a Lei Federal nº 9.982 de 14 de julho de 2000.</div>
    </div>
    ${member.inadimplente ? tarja() : ''}
  </div>`;
}

// Builder PURO: monta a página HTML (frente + verso na mesma página) que o
// expo-print converte em PDF. Reproduz o design do card (CardFront/CardBack)
// escalado 2x via transform (nitidez de impressão). Sem "Validade".
export function buildCardHtml(member: Member, assets: CardAssets, qrSvg: string): string {
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  /* Desativa o "font boosting"/auto-ajuste de fonte do WebView mobile (Android):
     sem isso, fontes muito pequenas (ex.: rótulo AUTENTICIDADE 4.5px) são infladas
     no celular, estouram a borda do cartão (overflow:hidden) e ficam cortadas —
     enquanto na web renderizam pequenas e cabem. */
  html { -webkit-text-size-adjust: 100%; text-size-adjust: 100%; }
  @page { size: A4; margin: 24px; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 40px;
    padding: 24px 0;
  }
  .card-wrap { width: 680px; height: 430px; }
  .card {
    position: relative;
    width: 340px;
    height: 215px;
    background: #f8fafc;
    border-radius: 12px;
    overflow: hidden;
    transform: scale(2);
    transform-origin: top left;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
  }
  .strip { position: absolute; top: 0; left: 0; }

  /* ---- Frente ---- */
  .photo-wrap { position: absolute; top: 12px; left: 12px; background: #fff; padding: 2px; border-radius: 3px; }
  .photo-img { width: 52px; height: 67px; border-radius: 4px; object-fit: cover; display: block; }
  .photo-ph {
    width: 52px; height: 67px; border-radius: 4px; background: #4a5568;
    border: 1.5px solid #718096; display: flex; align-items: center; justify-content: center; font-size: 24px;
  }
  .brasao { position: absolute; left: 8px; bottom: 6px; width: 44px; height: 44px; object-fit: contain; }
  .header { position: absolute; top: 6px; left: 84px; right: 8px; text-align: center; }
  .title-main { font-size: 15px; font-weight: 800; color: #3a4658; letter-spacing: 0.5px; text-transform: uppercase; }
  .title-sub { font-size: 12.5px; font-weight: 700; color: #4a5568; margin-top: 1px; text-transform: uppercase; }
  /* Coluna em fluxo entre o título e a base (como o CardFront): campos fluem do
     topo; o rodapé (versículo + CNPJ) é empurrado para baixo por margin-top:auto. */
  .content-front { position: absolute; top: 46px; left: 78px; right: 72px; bottom: 5px; display: flex; flex-direction: column; }
  .field { margin-bottom: 1px; }
  .f-label { font-size: 9px; color: #718096; line-height: 10px; }
  .f-value { font-size: 13px; font-weight: 700; color: #2d3748; line-height: 15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .f-value--multi { white-space: normal; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
  .fc-value { white-space: normal; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
  .front-footer { margin-top: auto; }
  .logo { position: absolute; right: 8px; top: 96px; width: 56px; height: 36px; object-fit: contain; }
  .qr-wrap { position: absolute; right: 6px; bottom: 6px; width: 54px; text-align: center; }
  .qr { width: 46px; height: 46px; margin: 0 auto; }
  .qr svg { width: 100%; height: 100%; display: block; }
  .qr-label { display: block; width: 54px; height: 8px; margin: 1px auto 0; }
  .versiculo { font-size: 7px; font-style: italic; color: #64748b; line-height: 9px; margin-bottom: 1px; }
  .cnpj { font-size: 7.5px; font-weight: 700; color: #475569; line-height: 10px; text-align: center; }

  /* ---- Verso ---- */
  .content-back { position: absolute; left: 94px; right: 0; top: 0; bottom: 0; padding: 8px 8px 6px 4px; display: flex; flex-direction: column; justify-content: space-between; }
  .field-wide { margin-bottom: 4px; }
  .f-value-b { font-size: 11.5px; font-weight: 700; color: #1a202c; line-height: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .grid { display: flex; flex-wrap: wrap; }
  .grid-cell { width: 50%; margin-bottom: 3px; }
  .sig-row { display: flex; gap: 10px; }
  .sig { flex: 1; min-width: 0; }
  .sig-img { width: 100%; height: 26px; object-fit: contain; margin-bottom: 1px; display: block; }
  .sig-line { height: 1px; background: #1a202c; margin-bottom: 2px; }
  .sig-name { font-size: 8px; font-weight: 700; color: #1a202c; line-height: 10px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sig-role { font-size: 7.5px; color: #718096; line-height: 10px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .legal { font-size: 7px; color: #718096; font-style: italic; line-height: 9.5px; }

  /* ---- Tarja de inadimplência ---- */
  .tarja { position: absolute; inset: 0; overflow: hidden; display: flex; align-items: center; justify-content: center; border-radius: 12px; }
  .veil { position: absolute; inset: 0; background: rgba(220, 38, 38, 0.14); }
  .band {
    position: absolute; width: 480px; padding: 7px 0; background: #dc2626; text-align: center;
    color: #fff; font-size: 20px; font-weight: 800; letter-spacing: 3px;
    transform: rotate(-30deg); border-top: 1px solid rgba(255, 255, 255, 0.28); border-bottom: 1px solid rgba(255, 255, 255, 0.28);
  }
</style>
</head>
<body>
  <div class="card-wrap">${front(member, assets, qrSvg)}</div>
  <div class="card-wrap">${back(member, assets)}</div>
</body>
</html>`;
}
