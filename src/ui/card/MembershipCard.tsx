import { useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import type { Member } from '@/model/member';
import CardFront from './CardFront';
import CardBack from './CardBack';

type Props = {
  member: Member;
};

export default function MembershipCard({ member }: Props) {
  const flipAnim = useRef(new Animated.Value(0)).current;
  const isFlippedRef = useRef(false);

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
      <TouchableOpacity onPress={flip} activeOpacity={1} style={s.shadow}>
        <View style={s.container}>
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
        </View>
      </TouchableOpacity>
      <Text style={s.hint}>↻  Toque para virar</Text>
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
});
