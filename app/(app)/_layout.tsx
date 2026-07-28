import { Stack } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DrawerContent from '@/ui/shell/DrawerContent';
import { colors } from '@/theme/theme';

const DRAWER_W = 280;

// Shell da área autenticada: header fixo (hambúrguer + "COPVASF") + drawer próprio
// com Animated (não Reanimated — incompatível com Expo Go SDK 54). Reproduz o MVP.
export default function AppLayout() {
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
    <View style={styles.root}>
      <SafeAreaView style={styles.header} edges={['top']}>
        <TouchableOpacity
          testID="menu-button"
          onPress={openDrawer}
          style={styles.menuBtn}
          hitSlop={8}
        >
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.title}>COPVASF</Text>
        <View style={styles.spacer} />
      </SafeAreaView>

      <View style={styles.content}>
        <Stack screenOptions={{ headerShown: false }} />
      </View>

      {open ? (
        <TouchableWithoutFeedback testID="drawer-backdrop" onPress={closeDrawer}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>
      ) : null}

      <Animated.View
        style={[styles.drawer, { transform: [{ translateX: anim }] }]}
        pointerEvents={open ? 'auto' : 'none'}
      >
        <SafeAreaView style={styles.drawerSafe} edges={['top', 'bottom']}>
          <DrawerContent onClose={closeDrawer} />
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.accentBlue,
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
  drawerSafe: {
    flex: 1,
  },
});
