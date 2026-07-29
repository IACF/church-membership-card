import { type ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const STRAIGHT = 78;
const TOTAL_W = 100;

type Props = {
  height?: number;
  children?: ReactNode;
};

export default function LeftStrip({ height = 215, children }: Props) {
  const curve = [
    `M 0 0`,
    `L ${STRAIGHT} 0`,
    `C ${TOTAL_W} ${height * 0.18} ${TOTAL_W} ${height * 0.68} ${STRAIGHT} ${height}`,
    `L 0 ${height} Z`,
  ].join(' ');

  return (
    <View style={{ position: 'absolute', left: 0, top: 0, width: TOTAL_W, height }}>
      <Svg width={TOTAL_W} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <Path d={curve} fill="#2d3748" />
      </Svg>
      <View
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: STRAIGHT,
          height,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
      </View>
    </View>
  );
}
