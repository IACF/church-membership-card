import { QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useSession } from '@/hooks/useSession';
import { queryClient } from '@/lib/queryClient';
import { resolveRedirect } from '@/session/route-guard';
import { colors } from '@/theme/theme';

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
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <RootNavigator />
      </SafeAreaProvider>
    </QueryClientProvider>
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
