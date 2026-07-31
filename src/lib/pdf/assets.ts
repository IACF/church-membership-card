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

// Resolve um asset PNG para uso no HTML do PDF. No nativo, embute como base64
// data URI (o WebView do print não acessa assets do bundler); na web, a URL do
// bundler é carregável pelo navegador direto.
async function moduleToSrc(mod: number): Promise<string> {
  const asset = Asset.fromModule(mod);
  await asset.downloadAsync();
  const uri = asset.localUri ?? asset.uri;
  if (Platform.OS === 'web') return uri;
  const base64 = await new File(uri).base64();
  return `data:image/png;base64,${base64}`;
}

// Resolve a foto do membro (photoUrl remoto). Nativo: baixa para o cache e embute
// como base64; web: usa a URL direto. Falha → undefined (o HTML cai no placeholder).
async function photoToSrc(url: string): Promise<string | undefined> {
  try {
    if (Platform.OS === 'web') return url;
    const dest = new File(Paths.cache, 'copvasf-card-photo.jpg');
    const downloaded = await File.downloadFileAsync(url, dest, { idempotent: true });
    const base64 = await downloaded.base64();
    downloaded.delete();
    return `data:image/jpeg;base64,${base64}`;
  } catch {
    return undefined;
  }
}

// Reúne todos os assets prontos para o buildCardHtml.
export async function resolveCardAssets(member: Member): Promise<CardAssets> {
  const [brasao, logo, assinaturaPresidente, assinaturaSecretario] = await Promise.all([
    moduleToSrc(BRASAO),
    moduleToSrc(LOGO),
    moduleToSrc(SIG_PRESIDENTE),
    moduleToSrc(SIG_SECRETARIO),
  ]);
  const photo = member.photoUrl ? await photoToSrc(member.photoUrl) : undefined;
  return { brasao, logo, assinaturaPresidente, assinaturaSecretario, photo };
}
