import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLogin } from '@/hooks/useLogin';
import { toAppError } from '@/model/errors';
import Button from '@/ui/components/Button';
import Input from '@/ui/components/Input';
import { colors, spacing } from '@/theme/theme';

interface LoginForm {
  identifier: string;
  password: string;
}

export default function LoginScreen() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ defaultValues: { identifier: '', password: '' } });
  const login = useLogin();
  const [serverError, setServerError] = useState<string | null>(null);

  const onSubmit = (data: LoginForm) => {
    setServerError(null);
    login.mutate(data, {
      onError: (e) => {
        const appErr = toAppError(e);
        setServerError(
          appErr.kind === 'network'
            ? appErr.message
            : appErr.kind === 'session-expired' // 401 no login = credenciais
              ? 'Registro/CPF ou senha inválidos'
              : 'Não foi possível entrar. Tente novamente.',
        );
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>Carteirinha COPVASF</Text>
        <Text style={styles.subtitle}>Entre com seu registro ou CPF</Text>

        <Controller
          control={control}
          name="identifier"
          rules={{ required: 'Informe o registro ou CPF' }}
          render={({ field: { onChange, value } }) => (
            <Input
              label="Registro ou CPF"
              testID="identifier"
              value={value}
              onChangeText={onChange}
              autoCapitalize="none"
              autoCorrect={false}
              error={errors.identifier?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          rules={{ required: 'Informe a senha' }}
          render={({ field: { onChange, value } }) => (
            <Input
              label="Senha"
              testID="password"
              value={value}
              onChangeText={onChange}
              secureToggle
              error={errors.password?.message}
            />
          )}
        />

        {serverError ? <Text style={styles.serverError}>{serverError}</Text> : null}

        <Button
          title="Entrar"
          testID="submit"
          onPress={handleSubmit(onSubmit)}
          loading={login.isPending}
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
    fontSize: 24,
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
