import { Platform } from 'react-native';
import { File, Paths } from 'expo-file-system';
import type { Member } from '@/model/member';
import type { CardAssets } from './cardHtml';
import {
  BRASAO_DATA_URL,
  LOGO_DATA_URL,
  SIG_PRESIDENTE_DATA_URL,
  SIG_SECRETARIO_DATA_URL,
} from './assets.base64';

// Assets estáticos do card embutidos em tempo de build (ver scripts/gen-pdf-assets.mjs).
//
// Antes eles eram resolvidos em runtime com `Asset.fromModule(...)` + leitura do
// arquivo. Isso funciona no dev, onde o Metro serve a imagem e ela vai parar no
// cache com um `file://` absoluto — mas quebra no APK de release: ali o Metro
// compila as imagens de `require()` como RECURSOS Android (res/), que não têm
// caminho de arquivo. A leitura falhava com
//   java.lang.IllegalArgumentException: URI is not absolute
// Embutido, o mesmo código serve dev, release, nativo e web.

// Baixa uma URL remota e converte para data URI base64. Usado só na web, para a
// FOTO do membro (URL http real, ao contrário dos assets estáticos já embutidos).
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
  // Estáticos: constantes, sem I/O nem resolução de asset — não podem falhar.
  const photo = member.photoUrl ? await photoToSrc(member.photoUrl) : undefined;
  return {
    brasao: BRASAO_DATA_URL,
    logo: LOGO_DATA_URL,
    assinaturaPresidente: SIG_PRESIDENTE_DATA_URL,
    assinaturaSecretario: SIG_SECRETARIO_DATA_URL,
    photo,
  };
}
