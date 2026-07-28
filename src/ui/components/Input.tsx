import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import type { TextInputProps } from 'react-native';
import { colors, spacing } from '@/theme/theme';

type Props = TextInputProps & {
  label: string;
  error?: string;
  // Quando true, gerencia a visibilidade da senha e mostra um botão de olho.
  secureToggle?: boolean;
};

export default function Input({
  label,
  error,
  secureToggle,
  secureTextEntry,
  testID,
  ...rest
}: Props) {
  const [hidden, setHidden] = useState(true);
  const isSecure = secureToggle ? hidden : secureTextEntry;

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          testID={testID}
          style={[
            styles.input,
            secureToggle ? styles.inputWithToggle : null,
            error ? styles.inputError : null,
          ]}
          secureTextEntry={isSecure}
          placeholderTextColor={colors.textSecondary}
          {...rest}
        />
        {secureToggle ? (
          <Pressable
            testID={testID ? `${testID}-toggle` : undefined}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Mostrar senha' : 'Ocultar senha'}
            style={styles.toggle}
            onPress={() => setHidden((h) => !h)}
          >
            <Text style={styles.toggleIcon}>{hidden ? '👁️' : '🙈'}</Text>
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.md,
  },
  label: {
    color: colors.card,
    fontSize: 13,
    marginBottom: spacing.xs,
  },
  inputRow: {
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: 15,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputWithToggle: {
    paddingRight: 44,
  },
  inputError: {
    borderColor: '#e53e3e',
  },
  toggle: {
    position: 'absolute',
    right: 4,
    height: '100%',
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleIcon: {
    fontSize: 18,
  },
  error: {
    color: '#feb2b2',
    fontSize: 12,
    marginTop: spacing.xs,
  },
});
