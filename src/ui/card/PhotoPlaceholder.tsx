import { View, Text, Image, type ImageSourcePropType } from 'react-native';

type Props = {
  size?: number;
  source?: ImageSourcePropType;
};

export default function PhotoPlaceholder({ size = 50, source }: Props) {
  const height = Math.round(size * 1.28);

  if (source) {
    return (
      <Image
        source={source}
        style={{ width: size, height, borderRadius: 4 }}
        resizeMode="cover"
      />
    );
  }

  return (
    <View
      style={{
        width: size,
        height,
        borderRadius: 4,
        backgroundColor: '#4a5568',
        borderWidth: 1.5,
        borderColor: '#718096',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontSize: Math.round(size * 0.46) }}>👤</Text>
    </View>
  );
}
