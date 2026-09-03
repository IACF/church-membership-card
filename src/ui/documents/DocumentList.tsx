import {
  ActivityIndicator,
  FlatList,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import { useDocuments } from '@/hooks/useDocuments';
import type { AppDocument, DocumentLocation } from '@/model/document';
import { colors, spacing } from '@/theme/theme';

type Props = {
  location: DocumentLocation;
};

// Abre o PDF do documento. No nativo, BAIXA o arquivo e abre a folha "abrir com"
// do sistema (visualizador de PDF), em vez de mandar a URL para o navegador.
// Na web (ou se o download/share falhar), cai para Linking (abre/baixa no browser).
async function openDocument(item: AppDocument): Promise<void> {
  if (Platform.OS === 'web') {
    void Linking.openURL(item.fileUrl).catch(() => undefined);
    return;
  }
  try {
    const safeName = (item.title || 'documento').replace(/[^\w.-]+/g, '_').slice(0, 80);
    const dest = new File(Paths.cache, `${safeName}.pdf`);
    if (dest.exists) dest.delete();
    const file = await File.downloadFileAsync(item.fileUrl, dest);
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(file.uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
    } else {
      void Linking.openURL(item.fileUrl).catch(() => undefined);
    }
  } catch {
    void Linking.openURL(item.fileUrl).catch(() => undefined);
  }
}

function DocumentListItem({ item }: { item: AppDocument }) {
  const open = () => {
    void openDocument(item);
  };

  return (
    <Pressable style={styles.item} onPress={open} testID={`document-${item.id}`}>
      <Text style={styles.itemTitle}>{item.title}</Text>
      {item.description ? <Text style={styles.itemDescription}>{item.description}</Text> : null}
    </Pressable>
  );
}

// Lista os documentos de um local (Documentos ou Informações do conselho). Usada
// pelas duas telas do app, variando só a prop `location`.
export default function DocumentList({ location }: Props) {
  const { data, isLoading, isError, refetch } = useDocuments(location);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.center}>
          <ActivityIndicator color={colors.accentBlue} />
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.center}>
          <Text style={styles.message}>Não foi possível carregar os documentos.</Text>
          <Pressable style={styles.retry} onPress={() => refetch()} testID="documents-retry">
            <Text style={styles.retryText}>Tentar novamente</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const documents = data ?? [];

  if (documents.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>📄</Text>
          <Text style={styles.message}>Nenhum documento disponível</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={documents}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <DocumentListItem item={item} />}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  listContent: {
    padding: spacing.md,
  },
  item: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  itemTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  itemDescription: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: spacing.xs,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: spacing.md,
  },
  message: {
    color: colors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
  },
  retry: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.accentBlue,
    borderRadius: 8,
  },
  retryText: {
    color: colors.card,
    fontWeight: '600',
  },
});
