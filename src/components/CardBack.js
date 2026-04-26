import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { membro } from '../data/member';
import LeftStrip from './LeftStrip';

const CARD_H = 215;
const CONTENT_LEFT = 92;
const QR_SIZE = 62;

export default function CardBack() {
  return (
    <>
      <LeftStrip height={CARD_H} />

      <View style={styles.content}>
        {/* Top: fields (left) + QR (right) */}
        <View style={styles.topRow}>
          <View style={styles.fieldsCol}>
            <View style={styles.fieldWide}>
              <Text style={styles.fieldLabel}>Filiação:</Text>
              <Text style={styles.fieldValue} numberOfLines={2}>
                {membro.filiacao}
              </Text>
            </View>
            <View style={styles.grid}>
              <GridField label="CPF:" value={membro.cpf} />
              <GridField label="Nascimento:" value={membro.nascimento} />
              <GridField label="Estado Civil:" value={membro.estadoCivil} />
              <GridField label="Validade:" value={membro.validade} />
            </View>
          </View>

          <View style={styles.qrBlock}>
            <Text style={styles.qrLabel}>AUTENTICIDADE</Text>
            <QRCode
              value="https://copvasf.org.br/membro/2024003"
              size={QR_SIZE}
              backgroundColor="#f8fafc"
            />
          </View>
        </View>

        {/* Signatures */}
        <View style={styles.sigRow}>
          <Signature name={membro.presidente} role="Presidente do COPVASF" />
          <Signature name={membro.secretario} role="Secretário Geral do COPVASF" />
        </View>

        {/* Legal text */}
        <Text style={styles.legal} numberOfLines={3}>
          O portador da presente, está apto a exercer suas atribuições como Capelão Eclesiástico de acordo com o Art. 5º, Inciso VII da CF e a Lei Federal nº 9.982 de 14 de julho de 2000.
        </Text>
      </View>
    </>
  );
}

function GridField({ label, value }) {
  return (
    <View style={styles.gridCell}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

function Signature({ name, role }) {
  return (
    <View style={styles.sig}>
      <View style={styles.sigLine} />
      <Text style={styles.sigName} numberOfLines={1}>{name}</Text>
      <Text style={styles.sigRole} numberOfLines={1}>{role}</Text>
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
    paddingTop: 8,
    paddingRight: 8,
    paddingBottom: 6,
    paddingLeft: 4,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    gap: 6,
  },
  fieldsCol: {
    flex: 1,
  },
  fieldWide: {
    marginBottom: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridCell: {
    width: '50%',
    marginBottom: 3,
  },
  fieldLabel: {
    fontSize: 7,
    color: '#718096',
    lineHeight: 9,
  },
  fieldValue: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#1a202c',
    lineHeight: 11,
  },
  qrBlock: {
    width: QR_SIZE + 4,
    alignItems: 'center',
  },
  qrLabel: {
    fontSize: 6,
    fontWeight: '700',
    color: '#718096',
    letterSpacing: 1,
    marginBottom: 3,
  },
  sigRow: {
    flexDirection: 'row',
    gap: 10,
  },
  sig: {
    flex: 1,
  },
  sigLine: {
    height: 1,
    backgroundColor: '#1a202c',
    marginBottom: 2,
  },
  sigName: {
    fontSize: 7,
    fontWeight: '700',
    color: '#1a202c',
    lineHeight: 9,
  },
  sigRole: {
    fontSize: 6.5,
    color: '#718096',
    lineHeight: 8.5,
  },
  legal: {
    fontSize: 6,
    color: '#718096',
    fontStyle: 'italic',
    lineHeight: 8.5,
  },
});
