import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { membro } from '../data/member';
import LeftStrip from './LeftStrip';
import PhotoPlaceholder from './PhotoPlaceholder';
import CopvasfLogo from './CopvasfLogo';

const CARD_H = 215;
const CONTENT_LEFT = 92;

export default function CardFront() {
  return (
    <>
      <LeftStrip height={CARD_H}>
        <PhotoPlaceholder size={50} source={require('../../assets/photo.png')} />
      </LeftStrip>

      <View style={styles.content}>
        <Text style={styles.titleMain}>CONSELHO DE PASTORES</Text>
        <Text style={styles.titleSub}>Do Vale do São Francisco</Text>

        <View style={styles.divider} />

        <Field label="Nome:" value={membro.nome} />
        <Field label="Função/Cargo:" value={membro.funcao} />
        <Field label="Registro:" value={membro.registro} />
        <Field label="Igreja:" value={membro.igreja} />

        <View style={styles.footer}>
          <Text style={styles.versiculo} numberOfLines={2}>
            {'"Um ao outro ajudou e ao seu companheiro disse: Esforça-te! (Is 41.6)"'}
          </Text>
          <View style={styles.logos}>
            <Text style={styles.brasao}>🇧🇷</Text>
            <CopvasfLogo />
          </View>
        </View>
      </View>
    </>
  );
}

function Field({ label, value }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    position: 'absolute',
    left: CONTENT_LEFT,
    right: 0,
    top: 0,
    bottom: 0,
    paddingTop: 9,
    paddingRight: 8,
    paddingBottom: 7,
    paddingLeft: 4,
  },
  titleMain: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1a202c',
    letterSpacing: 1.4,
  },
  titleSub: {
    fontSize: 9,
    color: '#4a5568',
    marginTop: 1,
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: '#cbd5e1',
    marginVertical: 5,
  },
  field: {
    marginBottom: 3,
  },
  fieldLabel: {
    fontSize: 7,
    color: '#718096',
    lineHeight: 9,
    letterSpacing: 0.3,
  },
  fieldValue: {
    fontSize: 9,
    fontWeight: '700',
    color: '#1a202c',
    lineHeight: 11,
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  versiculo: {
    fontSize: 6.5,
    fontStyle: 'italic',
    color: '#64748b',
    lineHeight: 10,
    marginBottom: 6,
  },
  logos: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  brasao: {
    fontSize: 22,
    lineHeight: 24,
  },
});
