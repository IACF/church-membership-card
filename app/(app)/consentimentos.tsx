import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { putConsentimentos } from '@/api/member.api';
import { useMember } from '@/hooks/useMember';
import { PRIVACIDADE_URL } from '@/lib/config';
import { formatDate } from '@/lib/format';
import { toAppError } from '@/model/errors';
import Button from '@/ui/components/Button';
import { colors, spacing } from '@/theme/theme';

// Tela onde o MEMBRO manifesta seu consentimento. É o único caminho por onde
// nasce consentimento colhido pelo aplicativo: o painel administrativo apenas
// registra termo assinado em papel, porque consentimento é ato do titular.
//
// A caixa nunca vem pré-marcada: ela reflete o estado atual vindo do servidor, e
// para quem nunca se manifestou esse estado é "pendente" — desmarcada.
export default function ConsentimentosScreen() {
  const { data: member, isPending, error } = useMember();
  const queryClient = useQueryClient();

  const estado = member?.consentimentos?.transferenciaInternacional.estado;
  const concedido = estado === 'concedido';
  const [desejado, setDesejado] = useState<boolean | null>(null);
  const marcado = desejado ?? concedido;

  const mutation = useMutation({
    mutationFn: (valor: boolean) => putConsentimentos({ transferenciaInternacional: valor }),
    onSuccess: () => {
      setDesejado(null);
      // Nada é gravado no aparelho antes da confirmação do servidor: em falha de
      // rede o estado local volta ao que o servidor conhece, sem estado parcial.
      void queryClient.invalidateQueries({ queryKey: ['me'] });
      Alert.alert('Pronto', 'Sua escolha foi registrada.');
    },
    onError: (e) => Alert.alert('Não foi possível salvar', toAppError(e).message),
  });

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

  const registro = member.consentimentos?.transferenciaInternacional;
  const alterado = desejado !== null && desejado !== concedido;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.title}>Consentimentos</Text>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Transferência internacional de dados</Text>
            <Switch
              testID="consent-transferencia"
              value={marcado}
              onValueChange={setDesejado}
              trackColor={{ false: '#475569', true: colors.accentBlue }}
            />
          </View>

          <Text style={styles.cardText}>
            Autorizo a transferência dos meus dados para fora do Brasil. Os dados da minha
            carteirinha ficam armazenados em servidor localizado nos{' '}
            <Text style={styles.destaque}>Estados Unidos da América</Text>, onde a legislação de
            proteção de dados é diferente da brasileira. O conselho decidiu transferir essa
            infraestrutura para o Brasil; até que isso ocorra, esta autorização é um dos fundamentos
            da operação. Posso revogá-la a qualquer momento, aqui mesmo.
          </Text>

          <Text style={styles.estado} testID="consent-estado">
            {estado === 'concedido'
              ? `Concedido em ${formatDate(registro?.concedidoEm ?? '')}`
              : estado === 'revogado'
                ? `Revogado em ${formatDate(registro?.revogadoEm ?? '')}`
                : 'Ainda não manifestado'}
          </Text>
        </View>

        <Text
          style={styles.link}
          testID="link-privacidade"
          onPress={() => void Linking.openURL(PRIVACIDADE_URL).catch(() => undefined)}
        >
          Ler a Política de Privacidade
        </Text>

        <View style={styles.actions}>
          <Button
            title={mutation.isPending ? 'Salvando…' : 'Salvar'}
            testID="salvar-consentimentos"
            disabled={!alterado || mutation.isPending}
            onPress={() => {
              if (desejado === null) return;
              if (!desejado) {
                Alert.alert(
                  'Revogar o consentimento?',
                  'Sua carteirinha continua funcionando normalmente. O conselho registrará sua revogação e ela constará do seu cadastro.',
                  [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                      text: 'Revogar',
                      style: 'destructive',
                      onPress: () => mutation.mutate(false),
                    },
                  ],
                );
                return;
              }
              mutation.mutate(true);
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  body: { padding: spacing.lg, gap: spacing.md },
  title: { color: '#f1f5f9', fontSize: 22, fontWeight: '700', marginBottom: spacing.xs },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  cardTitle: { color: '#f1f5f9', fontSize: 15, fontWeight: '700', flex: 1 },
  cardText: { color: '#cbd5e1', fontSize: 13, lineHeight: 19 },
  destaque: { color: '#f1f5f9', fontWeight: '700' },
  estado: { color: colors.textSecondary, fontSize: 12, marginTop: spacing.xs },
  link: { color: colors.accentGold, fontSize: 14, textDecorationLine: 'underline' },
  actions: { marginTop: spacing.md },
});
