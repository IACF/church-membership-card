import { Stack } from 'expo-router';

// Área autenticada. O drawer completo (Meu Perfil, Igrejas, etc.) é da Fase 4.
export default function AppLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
