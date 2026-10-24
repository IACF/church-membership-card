import { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import type { Member } from '@/model/member';
import CardFront from './CardFront';
import CardBack from './CardBack';
import DelinquencyBanner from './DelinquencyBanner';
import { CARD_W, CARD_H, computeCardScale } from './cardBase';

type Props = {
  member: Member;
  // Área de conteúdo medida pela tela (onLayout). Enquanto não chega — primeiro
  // frame — cai nas dimensões da janela, evitando piscar.
  available?: { width: number; height: number };
};

export default function MembershipCard({ member, available }: Props) {
  const flipAnim = useRef(new Animated.Value(0)).current;
  const isFlippedRef = useRef(false);

  // Escala responsiva: recalculada a cada mudança de dimensão (inclui rotação).
  // Usa a ÁREA MEDIDA quando disponível — é o que faz o cartão caber sem rolagem
  // em paisagem (spec `carteirinha-paisagem`); a janela é só o fallback do
  // primeiro frame. Aplicada como transform, preservando o layout absoluto.
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const scale = computeCardScale(
    available?.width ?? width,
    available?.height ?? height,
    isLandscape,
  );

  const flip = () => {
    const toValue = isFlippedRef.current ? 0 : 1;
    isFlippedRef.current = !isFlippedRef.current;

    Animated.spring(flipAnim, {
      toValue,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
  };

  const frontRotate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backRotate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  return (
    <View style={s.wrapper}>
      <TouchableOpacity onPress={flip} activeOpacity={1}>
        {/* Caixa externa reserva o tamanho JÁ escalado; o container base 340×215
            é escalado a partir do canto superior-esquerdo para preenchê-la. */}
        <View style={[s.shadow, { width: CARD_W * scale, height: CARD_H * scale }]}>
          <View style={[s.container, { transform: [{ scale }], transformOrigin: 'top left' }]}>
            <Animated.View
              style={[
                s.card,
                {
                  transform: [{ perspective: 1200 }, { rotateY: frontRotate }],
                  backfaceVisibility: 'hidden',
                },
              ]}
            >
              <CardFront member={member} />
            </Animated.View>

            <Animated.View
              style={[
                s.card,
                s.cardAbsolute,
                {
                  transform: [{ perspective: 1200 }, { rotateY: backRotate }],
                  backfaceVisibility: 'hidden',
                },
              ]}
            >
              <CardBack member={member} />
            </Animated.View>

            {/* Tarja de inadimplência: por cima das faces (fora do flip). */}
            {member.inadimplente ? <DelinquencyBanner /> : null}

            {/* Em PAISAGEM a dica vira um selo sobreposto no canto do cartão: ali
                ela não consome altura, que é o recurso escasso deitado. Fica
                dentro do container escalado, então acompanha o tamanho do cartão. */}
            {isLandscape ? (
              <Text style={s.hintOverlay} testID="flip-hint">
                ↻ virar
              </Text>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>

      {/* Em RETRATO há altura de sobra: a dica fica abaixo, mais legível. */}
      {!isLandscape ? (
        <Text style={s.hint} testID="flip-hint">
          ↻ Toque para virar
        </Text>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  shadow: {
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 22,
    elevation: 20,
  },
  container: {
    width: 340,
    height: 215,
  },
  card: {
    width: 340,
    height: 215,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardAbsolute: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  hint: {
    color: '#475569',
    fontSize: 12,
    marginTop: 14,
    letterSpacing: 0.3,
  },
  // Selo discreto no canto inferior direito do cartão (só em paisagem).
  // Posicionado em coordenadas da caixa-base 340×215, escalando junto.
  hintOverlay: {
    position: 'absolute',
    right: 8,
    bottom: 5,
    color: '#94a3b8',
    fontSize: 7.5,
    letterSpacing: 0.2,
  },
});
