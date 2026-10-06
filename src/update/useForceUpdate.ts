import { useEffect, useState } from 'react';
import { Linking, Platform } from 'react-native';
import { ANDROID_PACKAGE_ID, APP_VERSION, PLAY_STORE_URL } from '../config/appVersion';
import { useAppConfigQuery } from '../store/api/authApi';
import { fetchPlayStoreVersion } from './playStoreVersion';

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
 * The server's minimum version (GET app/config, re-read whenever the app
 * comes back to the foreground) decides on both platforms. On Android, when
 * the server sets no minimum, the version live on Google Play is used
 * instead. Debug builds are never blocked, and any failure lets the person
 * in: a wrong block costs more than a late update.
 */
export function useForceUpdate() {
  const config = useAppConfigQuery(undefined, { skip: __DEV__ });
  const serverMin =
    Platform.OS === 'android'
      ? config.data?.minVersion?.android
      : config.data?.minVersion?.ios;
  const iosAppId = config.data?.iosAppId ?? null;

  const [storeVersion, setStoreVersion] = useState<string | null>(null);

  // Android fallback: ask Google Play once per answer from the server.
  useEffect(() => {
    if (__DEV__ || Platform.OS !== 'android' || !config.data || serverMin) {
      return;
    }
    let live = true;
    fetchPlayStoreVersion()
      .then(latest => {
        if (live && latest && isNewer(latest, APP_VERSION)) {
          setStoreVersion(latest);
        }
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [config.data, serverMin]);

  const required = __DEV__
    ? null
    : serverMin && isNewer(serverMin, APP_VERSION)
    ? serverMin
    : storeVersion;

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
