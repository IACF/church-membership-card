import { Pressable, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors, spacing } from '@/theme/theme';

type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  testID?: string;
};

export default function Button({
  title,
  onPress,
  loading,
  disabled,
  testID,
}: Props) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      testID={testID}
      onPress={onPress}
      disabled={isDisabled}
      style={[styles.btn, isDisabled ? styles.disabled : null]}
    >
      {loading ? (
        <ActivityIndicator color={colors.card} />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: colors.accentBlue,
    borderRadius: 8,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '600',
  },
});
