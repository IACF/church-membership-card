import { View, Text, StyleSheet } from 'react-native';

export default function CopvasfLogo() {
  return (
    <View style={styles.box}>
      <Text style={styles.icon}>📖</Text>
      <Text style={styles.label}>COPVASF</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: '#1e2c3d',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
    alignItems: 'center',
    minWidth: 50,
    borderWidth: 1,
    borderColor: '#c9a227',
  },
  icon: {
    fontSize: 14,
    lineHeight: 16,
  },
  label: {
    color: '#e8c97a',
    fontSize: 6.5,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginTop: 2,
  },
});
