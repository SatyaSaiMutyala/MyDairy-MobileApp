import { Platform } from 'react-native';

// Where the Laravel backend runs.
// - iPhone simulator can reach the Mac as "localhost".
// - Android emulator reaches the Mac as 10.0.2.2.
// - A real phone needs the Mac's Wi-Fi address; set LAN_HOST to use it.
const LAN_HOST = '';
const DEV_HOST = LAN_HOST || (Platform.OS === 'android' ? '10.0.2.2' : 'localhost');

export const API_BASE_URL = __DEV__
  ? `http://${DEV_HOST}:8000/api/v1`
  : 'https://mydiary.mytrustlab.co.in/api/v1';

// Seconds before a request is given up on.
export const API_TIMEOUT = 20;
