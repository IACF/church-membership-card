import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMember } from '@/hooks/useMember';
import { toAppError } from '@/model/errors';
import MembershipCard from '@/ui/card/MembershipCard';
import ExportPdfButton from '@/ui/card/ExportPdfButton';
import { colors, spacing } from '@/theme/theme';

export default function CarteirinhaScreen() {
  const { data: member, isPending, error, refetch } = useMember();

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* ScrollView centraliza o conteúdo quando cabe e ROLA quando não cabe
          (ex.: paisagem, cartão grande) — sem cortar o topo do cartão nem o link. */}
      <ScrollView contentContainerStyle={styles.center} showsVerticalScrollIndicator={false}>
        {/* Prioriza o cache: se há dados (mesmo offline com refetch em erro),
            mostra a carteirinha. Só exibe erro quando não há nada em cache. */}
        {member ? (
          <>
            <MembershipCard member={member} />
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
