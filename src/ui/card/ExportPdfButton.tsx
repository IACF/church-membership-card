import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Member } from '@/model/member';
import { useExportCard } from '@/hooks/useExportCard';
import { colors, spacing } from '@/theme/theme';

type Props = {
  member: Member;
};

// Botão "Exportar PDF" abaixo da carteirinha: gera o PDF (frente+verso) e abre o
// compartilhamento. Enquanto gera, mostra spinner e fica desabilitado.
export default function ExportPdfButton({ member }: Props) {
  const { isExporting, error, exportCard } = useExportCard(member);

  return (
    <View style={s.wrap}>
      <Pressable
        testID="export-pdf"
        accessibilityRole="button"
        onPress={() => void exportCard()}
        disabled={isExporting}
        style={({ pressed }) => [s.btn, (isExporting || pressed) && s.btnPressed]}
      >
        {isExporting ? (
          <ActivityIndicator color="#ffffff" size="small" />
        ) : (
          <Text style={s.label}>Exportar PDF</Text>
        )}
      </Pressable>
      {error ? (
        <Text style={s.error} testID="export-error">
          {error.message}
        </Text>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  btn: {
    minWidth: 180,
    minHeight: 44,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: colors.accentBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPressed: {
    opacity: 0.85,
  },
  label: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  error: {
    color: colors.danger,
    fontSize: 13,
    marginTop: spacing.sm,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
});
