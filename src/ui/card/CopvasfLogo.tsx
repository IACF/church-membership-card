import { Image, StyleSheet } from 'react-native';

// Logo oficial do COPVASF (asset extraído do modelo do cliente).
export default function CopvasfLogo() {
  return (
    <Image
      source={require('../../../assets/copvasf-logo.png')}
      style={styles.logo}
      resizeMode="contain"
      testID="copvasf-logo"
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 56,
    height: 36,
  },
});
