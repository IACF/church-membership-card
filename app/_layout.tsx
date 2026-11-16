import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View, ActivityIndicator, Image, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useSession } from '@/hooks/useSession';
import { DAY, persister, queryClient } from '@/lib/queryClient';
import { resolveRedirect } from '@/session/route-guard';
import { colors } from '@/theme/theme';

// Marca exibida na abertura, enquanto a sessão é restaurada.
//
// A splash NATIVA (app.json) mostra só o livro, de propósito: desde o Android 12
// ela é renderizada dentro de uma máscara circular e qualquer texto seria
// cortado — "COPVASF" viraria "COPVAS". Aqui a tela é livre, então é onde o
// lockup completo cabe. As duas usam o mesmo fundo (#0f172a) e o livro na mesma
// posição relativa, então a transição passa despercebida.
const MARCA = require('../assets/copvasf-marca.png');

// Guard de rotas: decide entre (auth)/login, (auth)/change-password e (app).
function useProtectedRoute() {
  const { isAuthenticated, mustChangePassword, hydrated } = useSession();
  const segments = useSegments() as string[];
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;
    const target = resolveRedirect({ isAuthenticated, mustChangePassword }, segments);
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
        <Image
          source={MARCA}
          style={styles.marca}
          resizeMode="contain"
          testID="marca-boot"
          accessibilityLabel="COPVASF — Conselho de Pastores do Vale do São Francisco"
        />
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
  // Largura relativa: a marca acompanha a tela sem estourar em aparelho pequeno
  // nem ficar minúscula em tablet. A altura é limitada para sobrar espaço ao
  // indicador de carregamento mesmo em paisagem.
  marca: {
    width: '70%',
    maxWidth: 420,
    height: '45%',
    marginBottom: 28,
  },
});
