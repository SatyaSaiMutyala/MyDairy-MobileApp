import { Linking } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

export type Point = { lat: number; lng: number; accuracy: number | null };

// Longest the app will wait for a position before carrying on without one.
const GIVE_UP_AFTER = 6000;

// Asks for the phone's position. It ALWAYS answers: with the position, or
// with null when the person refuses, the phone cannot find it, or it takes
// too long. A record without a position is allowed, so nothing may ever
// wait on this.
export function getPosition(): Promise<Point | null> {
  return new Promise(resolve => {
    let answered = false;
    const done = (p: Point | null) => {
      if (!answered) {
        answered = true;
        clearTimeout(timer);
        resolve(p);
      }
    };
    const timer = setTimeout(() => done(null), GIVE_UP_AFTER);
    try {
      // getCurrentPosition asks for permission itself when it is needed.
      Geolocation.getCurrentPosition(
        pos =>
          done({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: Math.round(pos.coords.accuracy),
          }),
        () => done(null),
        { enableHighAccuracy: true, timeout: GIVE_UP_AFTER - 1000, maximumAge: 300000 },
      );
    } catch {
      done(null);
    }
  });
}

export const pointLabel = (p: Point) =>
  `${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}${p.accuracy != null ? ` ±${p.accuracy} m` : ''}`;

export const openInMaps = (p: Point) =>
  Linking.openURL(`https://www.google.com/maps?q=${p.lat},${p.lng}`);
