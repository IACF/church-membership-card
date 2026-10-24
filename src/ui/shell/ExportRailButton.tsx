import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useMember } from '@/hooks/useMember';
import { useExportCard } from '@/hooks/useExportCard';
import { colors } from '@/theme/theme';

// "Exportar PDF" na trilha vertical, exibido só em PAISAGEM.
//
// Deitado, a altura é o recurso escasso: o cartão usava 72% dela enquanto 45% da
// largura ficava vazia. Tirar a dica e o botão de baixo do cartão devolve essa
// altura e o cartão cresce ~34% (ver spec `carteirinha-paisagem`). O botão não
// some — migra para a trilha, onde ocupa largura ociosa e segue a um toque.
export default function ExportRailButton() {
  const { data: member } = useMember();
  const { isExporting, error, exportCard } = useExportCard(member);

  if (!member) return null;

  return (
    <View style={s.wrap}>
      <TouchableOpacity
        testID="export-pdf-rail"
        accessibilityRole="button"
        accessibilityLabel="Exportar PDF da carteirinha"
        onPress={() => void exportCard()}
        disabled={isExporting}
        hitSlop={8}
        style={isExporting ? s.disabled : undefined}
      >
        <Text style={s.icon}>{isExporting ? '…' : '⬇'}</Text>
        <Text style={s.label}>PDF</Text>
      </TouchableOpacity>

      {/* A trilha é estreita: a mensagem quebra em várias linhas e fica pequena,
          mas é o único lugar visível deitado — melhor que falhar em silêncio. */}
      {error ? (
        <Text style={s.error} numberOfLines={4} testID="export-rail-error">
          {error.message}
        </Text>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingBottom: 6,
  },
  disabled: {
    opacity: 0.5,
  },
  icon: {
    color: colors.textSecondary,
    fontSize: 18,
    textAlign: 'center',
  },
  label: {
    color: colors.textSecondary,
    fontSize: 9,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  error: {
    color: colors.danger,
    fontSize: 8,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 2,
  },
});
