import { useRouter } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMember } from '@/hooks/useMember';
import { formatCpf, formatDate, formatPhone } from '@/lib/format';
import { toAppError } from '@/model/errors';
import Button from '@/ui/components/Button';
import { colors, spacing } from '@/theme/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const { data: member, isPending, error } = useMember();

  // Prioriza o cache: só cai em loading/erro quando não há dados.
  if (!member) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.center}>
          {isPending ? (
            <ActivityIndicator color={colors.accentBlue} />
          ) : (
            <Text style={styles.errorText}>{toAppError(error).message}</Text>
          )}
        </View>
      </SafeAreaView>
    );
  }

  const rows: [string, string][] = [
    ['Nome', member.nomeCompleto],
    ['Registro', member.registro],
    ['Função/Cargo', member.funcao],
    ['Igreja', member.igreja],
    ['Filiação', member.filiacao],
    ['CPF', formatCpf(member.cpf)],
    ['Nascimento', formatDate(member.nascimento)],
    ['Estado Civil', member.estadoCivil],
    ['WhatsApp', formatPhone(member.whatsapp)],
  ];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.title}>Meu Perfil</Text>

        {rows.map(([label, value]) => (
          <View key={label} style={styles.row}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value}>{value}</Text>
          </View>
        ))}

        <View style={styles.actions}>
          <Button
            title="Alterar senha"
            testID="change-password"
            onPress={() => router.push('/(app)/change-password')}
          />
        </View>
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  body: {
    padding: spacing.lg,
  },
  title: {
    color: colors.card,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: spacing.lg,
  },
  row: {
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
    paddingVertical: spacing.sm,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  value: {
    color: colors.card,
    fontSize: 15,
    marginTop: 2,
  },
  actions: {
    marginTop: spacing.xl,
  },
});
