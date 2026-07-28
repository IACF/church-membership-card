import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { Session } from '@/model/session';

const SESSION_KEY = 'copvasf_member_session';

// expo-secure-store não existe na web → fallback para AsyncStorage (localStorage).
const isWeb = Platform.OS === 'web';

async function setItem(value: string): Promise<void> {
  if (isWeb) await AsyncStorage.setItem(SESSION_KEY, value);
  else await SecureStore.setItemAsync(SESSION_KEY, value);
}

async function getItem(): Promise<string | null> {
  return isWeb
    ? AsyncStorage.getItem(SESSION_KEY)
    : SecureStore.getItemAsync(SESSION_KEY);
}

async function removeItem(): Promise<void> {
  if (isWeb) await AsyncStorage.removeItem(SESSION_KEY);
  else await SecureStore.deleteItemAsync(SESSION_KEY);
}

export async function saveSession(session: Session): Promise<void> {
  await setItem(JSON.stringify(session));
}

export async function loadSession(): Promise<Session | null> {
  const raw = await getItem();
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  await removeItem();
}
