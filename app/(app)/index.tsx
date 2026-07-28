import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMember } from '@/hooks/useMember';
import { useSession } from '@/hooks/useSession';
import MembershipCard from '@/ui/card/MembershipCard';
import { colors, spacing } from '@/theme/theme';

export default function CarteirinhaScreen() {
  const { logout } = useSession();
  const { data: member, isPending, isError, refetch } = useMember();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.hello} numberOfLines={1}>
          {member?.nomeCompleto ?? 'Minha carteirinha'}
        </Text>
        <Pressable testID="logout" onPress={() => void logout()}>
          <Text style={styles.logout}>Sair</Text>
        </Pressable>
      </View>

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  hello: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  logout: {
    color: colors.accentBlue,
    fontSize: 15,
    fontWeight: '600',
    paddingHorizontal: spacing.sm,
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
