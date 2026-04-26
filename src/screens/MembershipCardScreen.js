import React from 'react';
import { View, StyleSheet } from 'react-native';
import MembershipCard from '../components/MembershipCard';

export default function MembershipCardScreen() {
  return (
    <View style={styles.container}>
      <MembershipCard />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
