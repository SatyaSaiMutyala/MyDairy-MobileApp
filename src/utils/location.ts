import { Linking } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

export type Point = { lat: number; lng: number; accuracy: number };

// Asks once for the phone's position. Resolves to null when the person
// refuses or the phone cannot find it: a record without a position is allowed.
export function getPosition(): Promise<Point | null> {
  return new Promise(resolve => {
    const done = (p: Point | null) => resolve(p);
    try {
      Geolocation.requestAuthorization(
        () =>
          Geolocation.getCurrentPosition(
            pos =>
              done({
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
                accuracy: Math.round(pos.coords.accuracy),
              }),
            () => done(null),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
          ),
        () => done(null),
      );
    } catch {
      done(null);
    }
  });
}

export const pointLabel = (p: Point) =>
  `${p.lat.toFixed(5)}, ${p.lng.toFixed(5)} ±${p.accuracy} m`;

export const openInMaps = (p: Point) =>
  Linking.openURL(`https://www.google.com/maps?q=${p.lat},${p.lng}`);
