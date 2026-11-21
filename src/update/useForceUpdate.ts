import { Linking, Platform } from 'react-native';
import { ANDROID_PACKAGE_ID, APP_VERSION, PLAY_STORE_URL } from '../config/appVersion';
import { useAppConfigQuery } from '../store/api/authApi';

// '1.10' is newer than '1.9': compare part by part as numbers.
export function isNewer(candidate: string, current: string): boolean {
  const a = candidate.split('.').map(n => parseInt(n, 10) || 0);
  const b = current.split('.').map(n => parseInt(n, 10) || 0);
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) {
    const x = a[i] ?? 0;
    const y = b[i] ?? 0;
    if (x !== y) {
      return x > y;
    }
  }
  return false;
}

/**
 * Tells whether this build is too old to keep using.
 *
 * Only the server decides (GET app/config, re-read whenever the app comes
 * back to the foreground). The server reads the stores itself and makes a
 * new version the minimum a day after it goes live, so a phone is never
 * asked to update to a build Google has not yet given it. The app used to
 * read the Play Store page directly; that is gone, it was the cause of the
 * "update required" popup on freshly installed apps. Debug builds are never
 * blocked, and any failure lets the person in.
 */
export function useForceUpdate() {
  const config = useAppConfigQuery(undefined, { skip: __DEV__ });
  const serverMin =
    Platform.OS === 'android'
      ? config.data?.minVersion?.android
      : config.data?.minVersion?.ios;
  const iosAppId = config.data?.iosAppId ?? null;

  const required = !__DEV__ && serverMin && isNewer(serverMin, APP_VERSION) ? serverMin : null;

  const openStore = async () => {
    if (Platform.OS === 'android') {
      // No canOpenURL guard: on Android 11+ it says no for schemes not listed
      // in <queries>, which would trap the person behind the dialog.
      try {
        await Linking.openURL(`market://details?id=${ANDROID_PACKAGE_ID}`);
      } catch {
        Linking.openURL(PLAY_STORE_URL).catch(() => {});
      }
      return;
    }
    const web = iosAppId
      ? `https://apps.apple.com/app/id${iosAppId}`
      : 'https://apps.apple.com/';
    try {
      await Linking.openURL(
        iosAppId ? `itms-apps://apps.apple.com/app/id${iosAppId}` : web,
      );
    } catch {
      Linking.openURL(web).catch(() => {});
    }
  };

  return {
    updateRequired: required !== null,
    storeVersion: required,
    openStore,
  };
}
