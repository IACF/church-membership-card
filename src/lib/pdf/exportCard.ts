import { Platform } from 'react-native';
import * as Print from 'expo-print';
import { File, Paths } from 'expo-file-system';
import type { Member } from '@/model/member';
import { toAppError } from '@/model/errors';
import { buildCardHtml } from './cardHtml';
import { resolveCardAssets } from './assets';
import { buildQrSvg } from './qr';
import { openPdf } from '@/lib/files/openPdf';

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

// Envolve uma etapa do export para saber ONDE falhou. Sem isto o usuário vê apenas
// "Algo deu errado" e o erro nativo original se perde — foi exatamente o que
// impediu o diagnóstico da falha de exportação em produção.
async function stage<T>(name: string, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    const cause = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    console.error(`[exportCard] falhou em "${name}":`, error);
    throw { __exportStage: name, __cause: cause } as ExportStageFailure;
  }
}

interface ExportStageFailure {
  __exportStage: string;
  __cause: string;
}

function isStageFailure(error: unknown): error is ExportStageFailure {
  return typeof error === 'object' && error !== null && '__exportStage' in error;
}

// Monta o HTML (frente+verso) a partir dos dados/assets/QR do membro.
async function buildHtml(member: Member): Promise<string> {
  const [assets, qrSvg] = await Promise.all([
    stage('assets', () => resolveCardAssets(member)),
    stage('qr', () => buildQrSvg(member.registro)),
  ]);
  return stage('html', async () => buildCardHtml(member, assets, qrSvg));
}

// Web: expo-print só faz window.print() da página atual (ignora o HTML). Então
// abrimos o HTML numa nova aba e imprimimos lá (o navegador salva como PDF).
// Importante: esperar as imagens (data URIs) decodificarem ANTES de imprimir —
// senão o PDF sai com as imagens em branco.
async function exportOnWeb(html: string): Promise<void> {
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.open();
  win.document.write(html);
  win.document.close();

  const imgs = Array.from(win.document.images);
  await Promise.all(
    imgs.map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            img.addEventListener('load', () => resolve());
            img.addEventListener('error', () => resolve());
          }),
    ),
  );

  win.focus();
  win.print();
}

// Nativo: gera o PDF em arquivo, renomeia para o nome amigável e abre no
// visualizador padrão do sistema (ver openPdf — ACTION_VIEW, não a folha de
// compartilhamento). Fechar o visualizador não é erro.
async function exportOnNative(html: string, member: Member): Promise<void> {
  const { uri } = await stage('print', () => Print.printToFileAsync({ html }));
  const dest = await stage('file', async () => {
    const target = new File(Paths.cache, pdfFileName(member));
    if (target.exists) target.delete();
    new File(uri).move(target);
    return target;
  });
  await stage('open', () => openPdf(dest.uri));
}

// Exporta a carteirinha (frente+verso) do membro em PDF. Lança AppError em falha.
export async function exportCardPdf(member: Member): Promise<void> {
  try {
    const html = await buildHtml(member);
    if (Platform.OS === 'web') {
      await exportOnWeb(html);
      return;
    }
    await exportOnNative(html, member);
  } catch (error) {
    if (isStageFailure(error)) {
      throw {
        kind: 'unknown' as const,
        message: 'Algo deu errado. Tente novamente.',
        detail: `[${error.__exportStage}] ${error.__cause}`,
      };
    }
    throw toAppError(error);
  }
}
