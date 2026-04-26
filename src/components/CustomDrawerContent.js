import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, StyleSheet } from 'react-native';
import { membro } from '../data/member';

const menuItems = [
  { key: 'card',     icon: '🪪', label: 'Minha Carteirinha',      active: true },
  { key: 'profile',  icon: '👤', label: 'Meu Perfil',              active: false },
  { key: 'churches', icon: '⛪', label: 'Igrejas do Conselho',      active: false },
  { key: 'info',     icon: '📋', label: 'Informações do Conselho',  active: false },
];

export default function CustomDrawerContent({ onClose }) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
      <View style={styles.header}>
        <Image
          source={require('../../assets/photo.png')}
          style={styles.avatar}
          resizeMode="cover"
        />
        <Text style={styles.nome}>{membro.nome}</Text>
        <Text style={styles.funcao}>{membro.funcao}</Text>
      </View>

      <View style={styles.divider} />

      {menuItems.map((item) => (
        <TouchableOpacity
          key={item.key}
          style={[styles.item, item.active && styles.itemActive]}
          onPress={onClose}
          activeOpacity={item.active ? 1 : 0.6}
        >
          <Text style={styles.itemIcon}>{item.icon}</Text>
          <Text style={[styles.itemLabel, item.active && styles.itemLabelActive]}>
            {item.label}
          </Text>
          {!item.active && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Em breve</Text>
            </View>
          )}
        </TouchableOpacity>
      ))}
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
  nome: {
    color: '#f1f5f9',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  funcao: {
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
  badge: {
    backgroundColor: '#162032',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#2d4a6b',
  },
  badgeText: {
    color: '#475569',
    fontSize: 10,
    fontWeight: '600',
  },
});
