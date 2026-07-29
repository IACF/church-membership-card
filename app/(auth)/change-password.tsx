import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PasswordChangeForm from '@/ui/PasswordChangeForm';
import { colors, spacing } from '@/theme/theme';

// 1º acesso / pós-reset: troca obrigatória. Ao concluir, o hook zera
// mustChangePassword e o guard (app/_layout) redireciona para a carteirinha.
export default function ForcedChangePasswordScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.body}>
        <Text style={styles.title}>Defina sua nova senha</Text>
        <Text style={styles.subtitle}>No primeiro acesso é necessário trocar a senha padrão.</Text>
        <PasswordChangeForm submitLabel="Salvar nova senha" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  title: {
    color: colors.card,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
});
