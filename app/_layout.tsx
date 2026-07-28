import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useSession } from '@/hooks/useSession';
import { DAY, queryClient } from '@/lib/queryClient';
import { resolveRedirect } from '@/session/route-guard';
import { colors } from '@/theme/theme';

// Persiste o cache do React Query no AsyncStorage → a carteirinha (query ['me'])
// reaparece offline com a última sincronização.
const persister = createAsyncStoragePersister({ storage: AsyncStorage });

// Guard de rotas: decide entre (auth)/login, (auth)/change-password e (app).
function useProtectedRoute() {
  const { isAuthenticated, mustChangePassword, hydrated } = useSession();
  const segments = useSegments() as string[];
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;
    const target = resolveRedirect(
      { isAuthenticated, mustChangePassword },
      segments,
    );
    if (target) {
      router.replace(target as never);
    }
  }, [hydrated, isAuthenticated, mustChangePassword, segments, router]);
}

function RootNavigator() {
  const { hydrate, hydrated } = useSession();

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useProtectedRoute();

  if (!hydrated) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator color={colors.accentBlue} />
      </View>
    );
  }
  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister, maxAge: DAY * 7 }}
    >
      <SafeAreaProvider>
        <StatusBar style="light" />
        <RootNavigator />
      </SafeAreaProvider>
    </PersistQueryClientProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
