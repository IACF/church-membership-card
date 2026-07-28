import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '@/ui/components/Button';
import PasswordChangeForm from '@/ui/PasswordChangeForm';
import { colors, spacing } from '@/theme/theme';

// Troca voluntária (a partir do Perfil). Não é obrigatória: ao concluir, mostra
// confirmação e volta ao Perfil (permanece autenticado).
export default function VoluntaryChangePasswordScreen() {
  const router = useRouter();
  const [done, setDone] = useState(false);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.body}>
        <Text style={styles.title}>Alterar senha</Text>
        {done ? (
          <View>
            <Text style={styles.success} testID="change-success">
              Senha alterada com sucesso.
            </Text>
            <Button
              title="Voltar ao perfil"
              testID="back"
              onPress={() => router.back()}
            />
          </View>
        ) : (
          <PasswordChangeForm
            submitLabel="Salvar"
            onSuccess={() => setDone(true)}
          />
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
    marginBottom: spacing.xl,
  },
  success: {
    color: '#86efac',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
});
