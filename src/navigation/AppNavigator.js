import React, { useState, useRef } from 'react';
import {
  View,
  Animated,
  TouchableOpacity,
  Text,
  TouchableWithoutFeedback,
  StyleSheet,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import MembershipCardScreen from '../screens/MembershipCardScreen';
import CustomDrawerContent from '../components/CustomDrawerContent';

const DRAWER_W = 280;

export default function AppNavigator() {
  const [open, setOpen] = useState(false);
  const anim = useRef(new Animated.Value(-DRAWER_W)).current;

  const openDrawer = () => {
    setOpen(true);
    Animated.timing(anim, {
      toValue: 0,
      duration: 240,
      useNativeDriver: true,
    }).start();
  };

  const closeDrawer = () => {
    Animated.timing(anim, {
      toValue: -DRAWER_W,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setOpen(false));
  };

  return (
    <SafeAreaProvider>
      <View style={s.root}>
        <SafeAreaView style={s.header} edges={['top']}>
          <TouchableOpacity onPress={openDrawer} style={s.menuBtn} hitSlop={8}>
            <Text style={s.menuIcon}>☰</Text>
          </TouchableOpacity>
          <Text style={s.title}>COPVASF</Text>
          <View style={s.spacer} />
        </SafeAreaView>

        <View style={s.content}>
          <MembershipCardScreen />
        </View>

        {open && (
          <TouchableWithoutFeedback onPress={closeDrawer}>
            <View style={s.backdrop} />
          </TouchableWithoutFeedback>
        )}

        <Animated.View style={[s.drawer, { transform: [{ translateX: anim }] }]}>
          <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
            <CustomDrawerContent onClose={closeDrawer} />
          </SafeAreaView>
        </Animated.View>
      </View>
    </SafeAreaProvider>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#3b82f6',
  },
  menuBtn: {
    width: 40,
    alignItems: 'center',
    paddingVertical: 4,
  },
  menuIcon: {
    color: '#f1f5f9',
    fontSize: 22,
  },
  title: {
    flex: 1,
    color: '#f1f5f9',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 1.5,
  },
  spacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_W,
    backgroundColor: '#1e293b',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
