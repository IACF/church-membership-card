import { Platform } from 'react-native';
import { Asset } from 'expo-asset';
import { File, Paths } from 'expo-file-system';
import type { Member } from '@/model/member';
import type { CardAssets } from './cardHtml';

// Assets estáticos do card (os mesmos exibidos na tela). require → módulo do bundler.
const BRASAO = require('../../../assets/brasao-republica.png');
const LOGO = require('../../../assets/copvasf-logo.png');
const SIG_PRESIDENTE = require('../../../assets/assinatura-presidente.png');
const SIG_SECRETARIO = require('../../../assets/assinatura-secretario.png');

// Baixa uma URL (bundler ou remota) e converte para data URI base64. Só usado na
// web (onde FileReader existe): garante que a imagem fique EMBUTIDA no HTML — uma
// URL relativa não resolveria na aba about:blank aberta para imprimir o PDF.
async function urlToDataUrl(url: string): Promise<string> {
  const res = await fetch(url);
  const blob = await res.blob();
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

// Resolve um asset PNG para data URI base64 (embutido no HTML do PDF). Web e nativo
// SEMPRE embutem: o WebView do print/aba não acessa assets do bundler por URL.
async function moduleToDataUrl(mod: number): Promise<string> {
  const asset = Asset.fromModule(mod);
  await asset.downloadAsync();
  const uri = asset.localUri ?? asset.uri;
  if (Platform.OS === 'web') return urlToDataUrl(uri);
  const base64 = await new File(uri).base64();
  return `data:image/png;base64,${base64}`;
}

// Resolve a foto do membro (photoUrl remoto) para uso no <img> do PDF.
// - Nativo: baixa e embute como base64.
// - Web: tenta embutir via fetch (base64); se falhar (o /uploads é servido SEM
//   header CORS, então fetch cross-origin é bloqueado), cai para a URL absoluta —
//   o <img> na aba de impressão exibe cross-origin sem exigir CORS, e o print
//   embute a imagem já renderizada no PDF.
// Sem foto ou falha total → undefined (o HTML usa o placeholder).
async function photoToSrc(url: string): Promise<string | undefined> {
  if (Platform.OS === 'web') {
    try {
      return await urlToDataUrl(url);
    } catch {
      return url;
    }
  }
  try {
    const dest = new File(Paths.cache, 'copvasf-card-photo.jpg');
    const downloaded = await File.downloadFileAsync(url, dest, { idempotent: true });
    const base64 = await downloaded.base64();
    downloaded.delete();
    return `data:image/jpeg;base64,${base64}`;
  } catch {
    return undefined;
  }
}

// Reúne todos os assets prontos (base64) para o buildCardHtml.
export async function resolveCardAssets(member: Member): Promise<CardAssets> {
  const [brasao, logo, assinaturaPresidente, assinaturaSecretario] = await Promise.all([
    moduleToDataUrl(BRASAO),
    moduleToDataUrl(LOGO),
    moduleToDataUrl(SIG_PRESIDENTE),
    moduleToDataUrl(SIG_SECRETARIO),
  ]);
  const photo = member.photoUrl ? await photoToSrc(member.photoUrl) : undefined;
  return { brasao, logo, assinaturaPresidente, assinaturaSecretario, photo };
}
