import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme/theme';

type Props = {
  label?: string;
};

// Tarja diagonal de inadimplência sobreposta à carteirinha. É montada pelo
// MembershipCard por cima das duas faces (fora da animação de flip) e se recorta
// ao contorno do cartão (overflow hidden + borderRadius). `pointerEvents="none"`
// para não capturar o toque — o flip do cartão continua funcionando por baixo.
export default function DelinquencyBanner({ label = 'INADIMPLENTE' }: Props) {
  return (
    <View style={styles.wrapper} pointerEvents="none">
      <View style={styles.veil} />
      <View style={styles.band}>
        <Text style={styles.text} numberOfLines={1}>
          {label}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Véu leve em tom de alerta: marca o cartão sem esconder os dados.
  veil: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(220, 38, 38, 0.14)',
  },
  // Faixa larga (maior que a diagonal do cartão) inclinada; as pontas sangram
  // para fora e são cortadas pelo overflow do wrapper.
  band: {
    position: 'absolute',
    width: 480,
    paddingVertical: 7,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-30deg' }],
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.28)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 6,
  },
  text: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 3,
  },
});
