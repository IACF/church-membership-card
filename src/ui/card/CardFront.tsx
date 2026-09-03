import { View, Text, Image, StyleSheet } from 'react-native';
import type { Member } from '@/model/member';
import LeftStrip from './LeftStrip';
import PhotoPlaceholder from './PhotoPlaceholder';
import CopvasfLogo from './CopvasfLogo';
import { CARD_H, fitCargoFontSize } from './cardBase';

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

      <View style={styles.logoWrap}>
        <CopvasfLogo />
      </View>

      {/* Coluna em FLUXO (não posições fixas): os campos fluem do topo e o rodapé
          (versículo + CNPJ) é empurrado para baixo por marginTop:auto. Assim o
          Cargo aparece COMPLETO (quebra em quantas linhas precisar) sem sobrepor
          nada — quando o cargo é longo, o versículo cede espaço naturalmente. A
          Igreja nunca é abreviada (até 2 linhas). */}
      <View style={styles.content}>
        <Field label="Nome:" value={member.nomeCompleto} />
        <FuncaoCargoField
          value={member.cargo ? `${member.funcao} - ${member.cargo}` : member.funcao}
        />
        <Field label="Registro:" value={member.registro} />
        <Field label="Igreja:" value={member.igreja} lines={2} />

        <View style={styles.footer}>
          <Text style={styles.versiculo} numberOfLines={2}>
            {'"Um ao outro ajudou e ao seu companheiro disse: Esforça-te! (Is 41.6)"'}
          </Text>
          {member.cnpj ? (
            <Text style={styles.cnpj} testID="cnpj" numberOfLines={1}>
              CNPJ: {member.cnpj}
            </Text>
          ) : null}
        </View>
      </View>
    </>
  );
}

function Field({ label, value, lines = 1 }: { label: string; value: string; lines?: number }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue} numberOfLines={lines}>
        {value}
      </Text>
    </View>
  );
}

// Função/Cargo: LIMITE MÁXIMO 2 linhas. Enquanto cabe em 2 linhas, usa a
// fonte-base; passando disso, a fonte diminui (fitCargoFontSize) para caber no
// mesmo espaço de 2 linhas normais. `adjustsFontSizeToFit` afina no device.
function FuncaoCargoField({ value }: { value: string }) {
  const fontSize = fitCargoFontSize(value);
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>Função/Cargo:</Text>
      <Text
        style={[styles.fieldValue, { fontSize, lineHeight: fontSize + 2 }]}
        numberOfLines={2}
        adjustsFontSizeToFit
        minimumFontScale={0.6}
      >
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
    top: 6,
    left: 84,
    right: 8,
  },
  titleMain: {
    fontSize: 15,
    fontWeight: '800',
    color: '#3a4658',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  titleSub: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#4a5568',
    marginTop: 1,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  content: {
    // Coluna em fluxo entre o título e o rodapé do cartão, à direita da faixa e
    // à esquerda do logo (right: 72). left/right evitam faixa e logo. top:46 deixa
    // uma folga abaixo do subtítulo (que subiu) para "Nome:" não colar no título.
    position: 'absolute',
    top: 46,
    left: 78,
    right: 72,
    bottom: 5,
  },
  footer: {
    // Empurra o rodapé (versículo + CNPJ) para a base; encolhe quando o conteúdo
    // acima cresce (cargo longo).
    marginTop: 'auto',
  },
  field: {
    marginBottom: 1,
  },
  fieldLabel: {
    fontSize: 9,
    color: '#718096',
    lineHeight: 10,
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
    fontSize: 7,
    fontStyle: 'italic',
    color: '#64748b',
    lineHeight: 9,
    marginBottom: 1,
  },
  cnpj: {
    // A coluna vai de x78 a x268 → o centro (~x173) coincide com o centro do
    // cartão (x170), então o texto centralizado fica no meio da carteirinha.
    fontSize: 7.5,
    fontWeight: '700',
    color: '#475569',
    lineHeight: 10,
    textAlign: 'center',
  },
  brasao: {
    position: 'absolute',
    left: 8,
    bottom: 6,
    width: 44,
    height: 44,
  },
});
