import { type ReactNode, useId } from 'react';
import { View } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

const TOTAL_W = 120;

type Props = {
  height?: number;
  children?: ReactNode;
};

// Faixa preta lateral no estilo do modelo oficial: banda escura à esquerda,
// estreita no topo e alargando para baixo (swoosh), com um realce cinza glossy
// por cima (camadas). Preto profundo com gradiente.
export default function LeftStrip({ height = 215, children }: Props) {
  const h = height;
  const TOP = 36; // largura da faixa no topo
  const BOT = 70; // largura na base (o swoosh desce e alarga)

  // IDs únicos por instância: há dois LeftStrip (frente/verso) e, na web, ids de
  // gradiente repetidos colidem — a faixa some ao remontar (navegação). useId evita.
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const baseId = `stripBase-${uid}`;
  const sheenId = `stripSheen-${uid}`;

  // Corpo principal (preto), borda direita convexa alargando para baixo.
  const base = [
    `M 0 0`,
    `L ${TOP} 0`,
    `C ${TOP + 10} ${h * 0.32} ${BOT + 14} ${h * 0.52} ${BOT} ${h}`,
    `L 0 ${h} Z`,
  ].join(' ');

  // Realce cinza (camada glossy): curva mais clara deslocada para dentro,
  // acompanhando a borda — dá o aspecto de camadas/brilho do original.
  const sheen = [
    `M ${TOP} 0`,
    `C ${TOP + 10} ${h * 0.32} ${BOT + 14} ${h * 0.52} ${BOT} ${h}`,
    `L ${BOT - 16} ${h}`,
    `C ${BOT - 6} ${h * 0.52} ${TOP - 4} ${h * 0.32} ${TOP - 16} 0`,
    `Z`,
  ].join(' ');

  return (
    <View style={{ position: 'absolute', left: 0, top: 0, width: TOTAL_W, height: h }}>
      <Svg width={TOTAL_W} height={h} style={{ position: 'absolute', top: 0, left: 0 }}>
        <Defs>
          <LinearGradient id={baseId} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#000000" />
            <Stop offset="0.55" stopColor="#0e1424" />
            <Stop offset="1" stopColor="#20293f" />
          </LinearGradient>
          <LinearGradient id={sheenId} x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#2b3550" />
            <Stop offset="1" stopColor="#4a5a7a" />
          </LinearGradient>
        </Defs>
        <Path d={base} fill={`url(#${baseId})`} />
        <Path d={sheen} fill={`url(#${sheenId})`} opacity={0.55} />
      </Svg>
      <View
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: TOTAL_W,
          height: h,
        }}
      >
        {children}
      </View>
    </View>
  );
}
