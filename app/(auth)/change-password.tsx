import { AxiosError } from 'axios';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useChangePassword } from '@/hooks/useChangePassword';
import Button from '@/ui/components/Button';
import Input from '@/ui/components/Input';
import { colors, spacing } from '@/theme/theme';

interface ChangePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export default function ChangePasswordScreen() {
  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ChangePasswordForm>({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });
  const changePassword = useChangePassword();
  const [serverError, setServerError] = useState<string | null>(null);

  const onSubmit = (data: ChangePasswordForm) => {
    setServerError(null);
    changePassword.mutate(data, {
      onError: (e) => {
        const status = (e as AxiosError)?.response?.status;
        setServerError(
          status === 401
            ? 'Senha atual incorreta'
            : 'Não foi possível alterar a senha. Tente novamente.',
        );
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>Defina sua nova senha</Text>
        <Text style={styles.subtitle}>
          No primeiro acesso é necessário trocar a senha padrão.
        </Text>

        <Controller
          control={control}
          name="currentPassword"
          rules={{ required: 'Informe a senha atual' }}
          render={({ field: { onChange, value } }) => (
            <Input
              label="Senha atual"
              testID="currentPassword"
              value={value}
              onChangeText={onChange}
              secureToggle
              error={errors.currentPassword?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="newPassword"
          rules={{
            required: 'Informe a nova senha',
            minLength: { value: 6, message: 'Mínimo de 6 caracteres' },
            validate: (v) =>
              v !== getValues('currentPassword') ||
              'A nova senha deve ser diferente da atual',
          }}
          render={({ field: { onChange, value } }) => (
            <Input
              label="Nova senha"
              testID="newPassword"
              value={value}
              onChangeText={onChange}
              secureToggle
              error={errors.newPassword?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="confirmNewPassword"
          rules={{
            required: 'Confirme a nova senha',
            validate: (v) =>
              v === getValues('newPassword') || 'As senhas não coincidem',
          }}
          render={({ field: { onChange, value } }) => (
            <Input
              label="Confirmar nova senha"
              testID="confirmNewPassword"
              value={value}
              onChangeText={onChange}
              secureToggle
              error={errors.confirmNewPassword?.message}
            />
          )}
        />

        {serverError ? <Text style={styles.serverError}>{serverError}</Text> : null}

        <Button
          title="Salvar nova senha"
          testID="submit"
          onPress={handleSubmit(onSubmit)}
          loading={changePassword.isPending}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  form: {
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
  serverError: {
    color: '#feb2b2',
    fontSize: 13,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
});
