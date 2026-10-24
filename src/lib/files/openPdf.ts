import { Platform } from 'react-native';
import * as Sharing from 'expo-sharing';
import * as IntentLauncher from 'expo-intent-launcher';
import { getContentUriAsync } from 'expo-file-system/legacy';

// Abre um PDF local no VISUALIZADOR padrão do sistema.
//
// Por que não `Sharing.shareAsync`: no Android ela dispara ACTION_SEND, que é a
// folha de COMPARTILHAMENTO ("enviar para…", "imprimir") — não o "abrir com".
// Era exatamente isso que fazia todo PDF do app (carteirinha e documentos) cair
// em compartilhar/imprimir em vez de abrir no leitor.
//
// O caminho correto é ACTION_VIEW, e ele exige um URI `content://`: desde o
// Android 7 (Nougat) entregar um `file://` a outro app lança FileUriExposedException.
// A flag 1 é FLAG_GRANT_READ_URI_PERMISSION, sem a qual o visualizador não
// consegue ler o arquivo que acabamos de gerar no cache.
//
// No iOS não existe "abrir com": a folha de compartilhamento É o mecanismo nativo
// para enviar o arquivo a outro app, então `shareAsync` continua sendo o certo.
//
// Se não houver leitor de PDF instalado, o ACTION_VIEW falha e caímos na folha de
// compartilhamento — o usuário ainda consegue salvar ou enviar o arquivo.
export async function openPdf(fileUri: string): Promise<void> {
  if (Platform.OS === 'android') {
    try {
      const contentUri = await getContentUriAsync(fileUri);
      await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
        data: contentUri,
        flags: 1,
        type: 'application/pdf',
      });
      return;
    } catch {
      // Sem visualizador (ou intent recusado): segue para o compartilhamento.
    }
  }

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
  }
}
