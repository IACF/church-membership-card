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
// Tipo MIME a partir da extensão da URL. As assinaturas são PNG (fundo
// transparente) e as fotos, JPEG — rotular tudo como JPEG, como se fazia antes,
// embutia bytes PNG com o rótulo errado no HTML do PDF.
function mimeDaUrl(url: string): string {
  const semQuery = url.split('?')[0].toLowerCase();
  if (semQuery.endsWith('.png')) return 'image/png';
  if (semQuery.endsWith('.webp')) return 'image/webp';
  return 'image/jpeg';
}

// Baixa uma imagem remota e devolve data URI base64.
//
// `nomeCache` É OBRIGATÓRIO e precisa ser ÚNICO por imagem. Antes esta função
// usava um nome fixo ('copvasf-card-photo.jpg'); quando passou a servir também
// às assinaturas, as três chamadas de resolveCardAssets — disparadas em paralelo
// por Promise.all — passaram a disputar O MESMO arquivo: uma sobrescrevia,
// outra apagava enquanto a terceira lia. Resultado em produção: a FOTO do membro
// saía impressa no lugar da assinatura no PDF.
async function remotaParaDataUrl(url: string, nomeCache: string): Promise<string | undefined> {
  if (Platform.OS === 'web') {
    try {
      return await urlToDataUrl(url);
    } catch {
      return url;
    }
  }
  try {
    const dest = new File(Paths.cache, nomeCache);
    const downloaded = await File.downloadFileAsync(url, dest, { idempotent: true });
    const base64 = await downloaded.base64();
    downloaded.delete();
    return `data:${mimeDaUrl(url)};base64,${base64}`;
  } catch {
    return undefined;
  }
}

async function photoToSrc(url: string): Promise<string | undefined> {
  return remotaParaDataUrl(url, 'copvasf-card-photo.jpg');
}

// Reúne todos os assets prontos (base64) para o buildCardHtml.
// Assinatura configurada no servidor: baixa e embute. Usa o MESMO caminho do
// `photoToSrc` (URL HTTPS absoluta → download → base64), que é comprovadamente
// seguro no APK de release — o que falhava eram assets EMPACOTADOS, resolvidos em
// runtime (ver BUILD-APK.md, armadilha nº 1). Sem URL, ou se o download falhar,
// devolve a constante embutida, para o PDF nunca sair com espaço em branco.
async function assinaturaToSrc(
  url: string | undefined,
  embutida: string,
  nomeCache: string,
): Promise<string> {
  if (!url) return embutida;
  return (await remotaParaDataUrl(url, nomeCache)) ?? embutida;
}

export async function resolveCardAssets(member: Member): Promise<CardAssets> {
  // Brasão e logo: constantes, sem I/O nem resolução de asset — não podem falhar.
  const [photo, assinaturaPresidente, assinaturaSecretario] = await Promise.all([
    member.photoUrl ? photoToSrc(member.photoUrl) : Promise.resolve(undefined),
    // Nomes de cache DISTINTOS: as três descargas correm em paralelo e um nome
    // compartilhado faz uma sobrescrever a outra (ver remotaParaDataUrl).
    assinaturaToSrc(
      member.assinaturas?.[0]?.imagemUrl,
      SIG_PRESIDENTE_DATA_URL,
      'copvasf-card-sig-1',
    ),
    assinaturaToSrc(
      member.assinaturas?.[1]?.imagemUrl,
      SIG_SECRETARIO_DATA_URL,
      'copvasf-card-sig-2',
    ),
  ]);
  return {
    brasao: BRASAO_DATA_URL,
    logo: LOGO_DATA_URL,
    assinaturaPresidente,
    assinaturaSecretario,
    photo,
  };
}
