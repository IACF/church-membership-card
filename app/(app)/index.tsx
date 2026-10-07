import { useState } from 'react';
import {
  ActivityIndicator,
  type LayoutChangeEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMember } from '@/hooks/useMember';
import { toAppError } from '@/model/errors';
import MembershipCard from '@/ui/card/MembershipCard';
import ExportPdfButton from '@/ui/card/ExportPdfButton';
import { colors, spacing } from '@/theme/theme';

export default function CarteirinhaScreen() {
  const { data: member, isPending, error, refetch } = useMember();

  // Área REALMENTE disponível para o cartão, medida em vez de deduzida: já vem
  // sem cabeçalho/trilha e sem área segura, em qualquer aparelho. É o que permite
  // o cartão caber sem rolagem em paisagem — ver spec `carteirinha-paisagem`.
  const [available, setAvailable] = useState<{ width: number; height: number } | null>(null);
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setAvailable((atual) =>
      atual && atual.width === width && atual.height === height ? atual : { width, height },
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']} onLayout={onLayout}>
      {/* Com a escala calculada sobre a área medida, o conteúdo cabe e nada rola.
          O ScrollView fica como rede de segurança (fonte do sistema ampliada,
          aparelho atípico): sem ele, o excedente ficaria inalcançável. */}
      <ScrollView contentContainerStyle={styles.center} showsVerticalScrollIndicator={false}>
        {/* Prioriza o cache: se há dados (mesmo offline com refetch em erro),
            mostra a carteirinha. Só exibe erro quando não há nada em cache. */}
        {member ? (
          <>
            <MembershipCard member={member} available={available ?? undefined} />
            <ExportPdfButton member={member} />
          </>
        ) : isPending ? (
          <ActivityIndicator color={colors.accentBlue} />
        ) : (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{toAppError(error).message}</Text>
            <Pressable testID="retry" onPress={() => void refetch()}>
              <Text style={styles.retry}>Tentar novamente</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
  },
  errorBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: spacing.sm,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  retry: {
    color: colors.accentBlue,
    fontSize: 15,
    fontWeight: '600',
  },
});
