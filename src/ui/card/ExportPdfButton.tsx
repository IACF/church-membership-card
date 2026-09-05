import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Member } from '@/model/member';
import { useExportCard } from '@/hooks/useExportCard';
import { colors, spacing } from '@/theme/theme';

type Props = {
  member: Member;
};

// Link discreto "Exportar PDF" abaixo da carteirinha: gera o PDF (frente+verso) e
// abre o compartilhamento. Propositalmente sutil (texto sublinhado, tom suave) —
// não deve chamar atenção. Enquanto gera, mostra "Exportando…" e fica desabilitado.
export default function ExportPdfButton({ member }: Props) {
  const { isExporting, error, exportCard } = useExportCard(member);

  return (
    <View style={s.wrap}>
      <Pressable
        testID="export-pdf"
        accessibilityRole="link"
        onPress={() => void exportCard()}
        disabled={isExporting}
        hitSlop={8}
      >
        <Text style={[s.link, isExporting && s.linkDisabled]}>
          {isExporting ? 'Exportando…' : 'Exportar PDF'}
        </Text>
      </Pressable>
      {error ? (
        <Text style={s.error} testID="export-error">
          {error.message}
        </Text>
      ) : null}
      {error?.detail ? (
        <Text style={s.errorDetail} testID="export-error-detail" selectable>
          {error.detail}
        </Text>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  link: {
    color: colors.textSecondary,
    fontSize: 13,
    textDecorationLine: 'underline',
    letterSpacing: 0.2,
  },
  linkDisabled: {
    opacity: 0.6,
  },
  error: {
    color: colors.danger,
    fontSize: 12,
    marginTop: spacing.xs,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  // Detalhe técnico: discreto e selecionável, para o usuário copiar e reportar.
  errorDetail: {
    color: colors.textSecondary,
    fontSize: 10,
    marginTop: spacing.xs,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
});
