import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMember } from '@/hooks/useMember';
import MembershipCard from '@/ui/card/MembershipCard';
import { colors, spacing } from '@/theme/theme';

export default function CarteirinhaScreen() {
  const { data: member, isPending, isError, refetch } = useMember();

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.center}>
        {isPending ? (
          <ActivityIndicator color={colors.accentBlue} />
        ) : isError || !member ? (
          <View style={styles.center}>
            <Text style={styles.errorText}>
              Não foi possível carregar sua carteirinha.
            </Text>
            <Pressable testID="retry" onPress={() => void refetch()}>
              <Text style={styles.retry}>Tentar novamente</Text>
            </Pressable>
          </View>
        ) : (
          <MembershipCard member={member} />
        )}
      </View>
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
