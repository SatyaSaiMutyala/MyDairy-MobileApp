import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ApiUser } from './api/authApi';

const KEY = 'mydiary.session';

type Saved = { token: string; user: ApiUser };

// The token and profile stay on the phone so people do not sign in every day.
export async function loadSession(): Promise<Saved | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Saved) : null;
  } catch {
    return null;
  }
}

export async function saveSession(saved: Saved | null): Promise<void> {
  try {
    if (saved) {
      await AsyncStorage.setItem(KEY, JSON.stringify(saved));
    } else {
      await AsyncStorage.removeItem(KEY);
    }
  } catch {
    // Storage failing must never block the app; the person just signs in again.
  }
}
