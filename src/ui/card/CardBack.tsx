import { View, Text, Image, StyleSheet, type ImageSourcePropType } from 'react-native';
import type { Member } from '@/model/member';
import { formatCpf, formatDate } from '@/lib/format';
import LeftStrip from './LeftStrip';
import { CARD_H } from './cardBase';

// Assinaturas fixas (sempre as mesmas) — extraídas do modelo oficial do cliente.
const ASSINATURA_PRESIDENTE = require('../../../assets/assinatura-presidente.png');
const ASSINATURA_SECRETARIO = require('../../../assets/assinatura-secretario.png');

const CONTENT_LEFT = 94;

type Props = {
  member: Member;
};

export default function CardBack({ member }: Props) {
  return (
    <>
      <LeftStrip height={CARD_H} />

      <View style={styles.content}>
        <View style={styles.fieldWide}>
          <Text style={styles.fieldLabel}>Filiação:</Text>
          {member.nomePai ? (
            <Text style={styles.fieldValue} numberOfLines={1}>
              {member.nomePai}
            </Text>
          ) : null}
          <Text style={styles.fieldValue} numberOfLines={1}>
            {member.nomeMae}
          </Text>
        </View>

        <View style={styles.grid}>
          <GridField label="CPF:" value={formatCpf(member.cpf)} />
          <GridField label="Nascimento:" value={formatDate(member.nascimento)} />
          <GridField label="Estado Civil:" value={member.estadoCivil} />
        </View>

        <View style={styles.sigRow}>
          <Signature
            name={member.presidente}
            role="Presidente do COPVASF"
            signature={ASSINATURA_PRESIDENTE}
            testID="sig-presidente"
          />
          <Signature
            name={member.secretario}
            role="Secretário Geral do COPVASF"
            signature={ASSINATURA_SECRETARIO}
            testID="sig-secretario"
          />
        </View>

        <Text style={styles.legal} numberOfLines={3}>
          O portador da presente, está apto a exercer suas atribuições como Capelão Eclesiástico de
          acordo com o Art. 5º, Inciso VII da CF e a Lei Federal nº 9.982 de 14 de julho de 2000.
        </Text>
      </View>
    </>
  );
}

function GridField({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.gridCell}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function Signature({
  name,
  role,
  signature,
  testID,
}: {
  name: string;
  role: string;
  signature: ImageSourcePropType;
  testID: string;
}) {
  return (
    <View style={styles.sig}>
      <Image source={signature} style={styles.sigImage} resizeMode="contain" testID={testID} />
      <View style={styles.sigLine} />
      <Text style={styles.sigName} numberOfLines={1}>
        {name}
      </Text>
      <Text style={styles.sigRole} numberOfLines={1}>
        {role}
      </Text>
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
    fontSize: 9,
    color: '#718096',
    lineHeight: 12,
  },
  fieldValue: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#1a202c',
    lineHeight: 14,
  },
  sigRow: {
    flexDirection: 'row',
    gap: 10,
  },
  sig: {
    flex: 1,
  },
  sigImage: {
    width: '100%',
    height: 26,
    marginBottom: 1,
  },
  sigLine: {
    height: 1,
    backgroundColor: '#1a202c',
    marginBottom: 2,
  },
  sigName: {
    fontSize: 8,
    fontWeight: '700',
    color: '#1a202c',
    lineHeight: 10,
  },
  sigRole: {
    fontSize: 7.5,
    color: '#718096',
    lineHeight: 10,
  },
  legal: {
    fontSize: 7,
    color: '#718096',
    fontStyle: 'italic',
    lineHeight: 9.5,
  },
});
