import { View, Text, Image, StyleSheet } from 'react-native';
import type { Member } from '@/model/member';
import LeftStrip from './LeftStrip';
import PhotoPlaceholder from './PhotoPlaceholder';
import CopvasfLogo from './CopvasfLogo';

const CARD_H = 215;

type Props = {
  member: Member;
};

export default function CardFront({ member }: Props) {
  // Sem foto → source undefined: o PhotoPlaceholder exibe o ícone padrão (thumbnail).
  const photoSource = member.photoUrl ? { uri: member.photoUrl } : undefined;

  return (
    <>
      <LeftStrip height={CARD_H} />

      {/* Foto no topo-esquerdo, com borda branca (como no modelo oficial). */}
      <View style={styles.photoWrap}>
        <PhotoPlaceholder size={52} source={photoSource} />
      </View>

      {/* Brasão da República no canto inferior-esquerdo, sobre a faixa. */}
      <Image
        source={require('../../../assets/brasao-republica.png')}
        style={styles.brasao}
        resizeMode="contain"
        testID="brasao"
      />

      {/* Título no topo, à direita da foto. */}
      <View style={styles.header}>
        <Text style={styles.titleMain}>CONSELHO DE PASTORES</Text>
        <Text style={styles.titleSub}>Do Vale do São Francisco</Text>
      </View>

      {/* Campos abaixo da foto, ocupando a largura. */}
      <View style={styles.body}>
        <Field label="Nome:" value={member.nomeCompleto} />
        <Field label="Função/Cargo:" value={member.funcao} />
        <Field label="Registro:" value={member.registro} />
        <Field label="Igreja:" value={member.igreja} />
      </View>

      <View style={styles.logoWrap}>
        <CopvasfLogo />
      </View>

      <Text style={styles.versiculo} numberOfLines={2}>
        {'"Um ao outro ajudou e ao seu companheiro disse: Esforça-te! (Is 41.6)"'}
      </Text>
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  photoWrap: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#ffffff',
    padding: 2,
    borderRadius: 3,
  },
  header: {
    position: 'absolute',
    top: 16,
    left: 84,
    right: 8,
  },
  titleMain: {
    fontSize: 15,
    fontWeight: '800',
    color: '#3a4658',
    letterSpacing: 0.5,
  },
  titleSub: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#4a5568',
    marginTop: 1,
  },
  body: {
    position: 'absolute',
    top: 52,
    left: 78,
    right: 72,
  },
  field: {
    marginBottom: 4,
  },
  fieldLabel: {
    fontSize: 9,
    color: '#718096',
    lineHeight: 11,
  },
  fieldValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2d3748',
    lineHeight: 15,
  },
  logoWrap: {
    position: 'absolute',
    right: 8,
    top: 96,
  },
  versiculo: {
    position: 'absolute',
    left: 74,
    right: 8,
    bottom: 6,
    fontSize: 7.5,
    fontStyle: 'italic',
    color: '#64748b',
    lineHeight: 10,
  },
  brasao: {
    position: 'absolute',
    left: 8,
    bottom: 6,
    width: 44,
    height: 44,
  },
});
