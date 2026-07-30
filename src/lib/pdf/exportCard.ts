import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import type { Member } from '@/model/member';
import { toAppError } from '@/model/errors';
import { buildCardHtml } from './cardHtml';
import { resolveCardAssets } from './assets';
import { buildQrSvg } from './qr';

// Nome do arquivo espelhando o padrão do cliente (Carteirinha_COPVASF_<Nome>.pdf),
// com o nome normalizado (sem acentos, espaços/símbolos → _).
export function pdfFileName(member: Member): string {
  const normalized = member.nomeCompleto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // remove os diacríticos separados pelo NFD
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return `Carteirinha_COPVASF_${normalized || 'Membro'}.pdf`;
}

// Monta o HTML (frente+verso) a partir dos dados/assets/QR do membro.
async function buildHtml(member: Member): Promise<string> {
  const [assets, qrSvg] = await Promise.all([
    resolveCardAssets(member),
    buildQrSvg(member.registro),
  ]);
  return buildCardHtml(member, assets, qrSvg);
}

// Web: expo-print só faz window.print() da página atual (ignora o HTML). Então
// abrimos o HTML numa nova aba e imprimimos lá (o navegador salva como PDF).
function exportOnWeb(html: string): void {
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  win.print();
}

// Nativo: gera o PDF em arquivo, renomeia para o nome amigável e abre a folha de
// compartilhamento (salvar/enviar). Cancelar a folha não é erro (shareAsync resolve).
async function exportOnNative(html: string, member: Member): Promise<void> {
  const { uri } = await Print.printToFileAsync({ html });
  const dest = new File(Paths.cache, pdfFileName(member));
  if (dest.exists) dest.delete();
  new File(uri).move(dest);
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(dest.uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
  }
}

// Exporta a carteirinha (frente+verso) do membro em PDF. Lança AppError em falha.
export async function exportCardPdf(member: Member): Promise<void> {
  try {
    const html = await buildHtml(member);
    if (Platform.OS === 'web') {
      exportOnWeb(html);
      return;
    }
    await exportOnNative(html, member);
  } catch (error) {
    throw toAppError(error);
  }
}
