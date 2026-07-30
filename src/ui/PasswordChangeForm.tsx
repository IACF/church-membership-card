import { AxiosError } from 'axios';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, Text, View } from 'react-native';
import { useChangePassword } from '@/hooks/useChangePassword';
import Button from '@/ui/components/Button';
import Input from '@/ui/components/Input';
import { spacing } from '@/theme/theme';

interface ChangePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

type Props = {
  submitLabel?: string;
  onSuccess?: () => void;
};

// Formulário de troca de senha reutilizado no 1º acesso (obrigatório) e no Perfil
// (voluntário). Regras: nova ≥ 6, ≠ atual, confirmação igual. Usa /auth/change-password.
export default function PasswordChangeForm({ submitLabel = 'Salvar', onSuccess }: Props) {
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
      onSuccess: () => onSuccess?.(),
      onError: (e) => {
        // O server devolve 422 para erros de validação da senha (senha atual
        // incorreta, nova == atual), cada um com sua mensagem — exibimos a do
        // server e mantemos a tela. 401 fica só para token inválido (o
        // interceptor desloga), então não cai aqui. Ver spec `troca-senha`.
        const err = e as AxiosError<{ message?: string }>;
        const status = err?.response?.status;
        const serverMessage = err?.response?.data?.message;
        setServerError(
          status === 422 && serverMessage
            ? serverMessage
            : 'Não foi possível alterar a senha. Tente novamente.',
        );
      },
    });
  };

  return (
    <View>
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
            v !== getValues('currentPassword') || 'A nova senha deve ser diferente da atual',
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
          validate: (v) => v === getValues('newPassword') || 'As senhas não coincidem',
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
        title={submitLabel}
        testID="submit"
        onPress={handleSubmit(onSubmit)}
        loading={changePassword.isPending}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  serverError: {
    color: '#feb2b2',
    fontSize: 13,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
});
