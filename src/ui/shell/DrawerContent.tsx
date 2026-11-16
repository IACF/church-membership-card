import { useRouter, useSegments } from 'expo-router';
import { Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useMember } from '@/hooks/useMember';
import { useSession } from '@/hooks/useSession';
import { PRIVACIDADE_URL, TERMOS_URL } from '@/lib/config';

type Props = {
  onClose: () => void;
};

export default function DrawerContent({ onClose }: Props) {
  const router = useRouter();
  const segments = useSegments() as string[];
  const sub = segments[1]; // undefined na carteirinha (raiz de (app))
  const { logout } = useSession();
  const { data: member } = useMember();

  const items = [
    {
      key: 'card',
      icon: '🪪',
      label: 'Minha Carteirinha',
      active: !sub,
      onPress: () => {
        onClose();
        router.replace('/(app)');
      },
    },
    {
      key: 'profile',
      icon: '👤',
      label: 'Meu Perfil',
      active: sub === 'profile',
      onPress: () => {
        onClose();
        router.push('/(app)/profile');
      },
    },
    {
      key: 'info',
      icon: '📋',
      label: 'Informações do conselho',
      active: sub === 'informacoes-conselho',
      onPress: () => {
        onClose();
        router.push('/(app)/informacoes-conselho');
      },
    },
    {
      key: 'consentimentos',
      icon: '✍️',
      label: 'Consentimentos',
      active: sub === 'consentimentos',
      onPress: () => {
        onClose();
        router.push('/(app)/consentimentos');
      },
    },
    {
      key: 'docs',
      icon: '📄',
      label: 'Documentos',
      active: sub === 'documentos',
      onPress: () => {
        onClose();
        router.push('/(app)/documentos');
      },
    },
  ];

  // Abertos no navegador do sistema, e não numa WebView interna, de propósito:
  // documento legal precisa ser compartilhável e imprimível, e o endereço tem de
  // ficar visível ao membro. O .catch evita que a ausência de navegador derrube
  // a tela.
  const legais = [
    { key: 'privacidade', icon: '🔒', label: 'Política de Privacidade', url: PRIVACIDADE_URL },
    { key: 'termos', icon: '📜', label: 'Termos de Uso', url: TERMOS_URL },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
      <View style={styles.header}>
        {member?.photoUrl ? (
          <Image source={{ uri: member.photoUrl }} style={styles.avatar} resizeMode="cover" />
        ) : (
          // Sem foto → avatar padrão (ícone de thumbnail).
          <View style={[styles.avatar, styles.avatarFallback]}>
            <Text style={styles.avatarIcon}>👤</Text>
          </View>
        )}
        <Text style={styles.nome} numberOfLines={2}>
          {member?.nomeCompleto ?? ''}
        </Text>
        {member?.registro ? <Text style={styles.registro}>Registro: {member.registro}</Text> : null}
      </View>

      <View style={styles.divider} />

      {items.map((item) => (
        <TouchableOpacity
          key={item.key}
          testID={`drawer-${item.key}`}
          style={[styles.item, item.active && styles.itemActive]}
          onPress={item.onPress}
          activeOpacity={0.7}
        >
          <Text style={styles.itemIcon}>{item.icon}</Text>
          <Text style={[styles.itemLabel, item.active && styles.itemLabelActive]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}

      <View style={styles.divider} />

      {legais.map((item) => (
        <TouchableOpacity
          key={item.key}
          testID={`drawer-${item.key}`}
          style={styles.item}
          onPress={() => {
            onClose();
            void Linking.openURL(item.url).catch(() => undefined);
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.itemIcon}>{item.icon}</Text>
          <Text style={styles.itemLabel}>{item.label}</Text>
        </TouchableOpacity>
      ))}

      <View style={styles.spacer} />

      <TouchableOpacity
        testID="drawer-logout"
        style={styles.item}
        onPress={() => {
          onClose();
          void logout();
        }}
        activeOpacity={0.7}
      >
        <Text style={styles.itemIcon}>🚪</Text>
        <Text style={styles.itemLabel}>Sair</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e293b',
  },
  inner: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 24,
    alignItems: 'center',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginBottom: 12,
  },
  avatarFallback: {
    backgroundColor: '#334155',
    borderWidth: 1.5,
    borderColor: '#475569',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarIcon: {
    fontSize: 34,
  },
  nome: {
    color: '#f1f5f9',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  registro: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#334155',
    marginHorizontal: 20,
    marginBottom: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 12,
  },
  itemActive: {
    backgroundColor: '#0d1b2e',
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
    paddingLeft: 17,
  },
  itemIcon: {
    fontSize: 18,
    width: 24,
    textAlign: 'center',
  },
  itemLabel: {
    color: '#94a3b8',
    fontSize: 14,
    flex: 1,
  },
  itemLabelActive: {
    color: '#f1f5f9',
    fontWeight: '600',
  },
  spacer: {
    flex: 1,
    minHeight: 12,
  },
});
