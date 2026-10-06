import { Platform } from 'react-native';

// Where the Laravel backend runs.
//
// The app talks to the live server. To work against a backend on this Mac
// instead (php artisan serve on port 8000), set USE_LOCAL to true:
// - iPhone simulator reaches the Mac as "localhost".
// - Android emulator reaches the Mac as 10.0.2.2.
// - A real phone needs the Mac's Wi-Fi address; set LAN_HOST to use it.
const USE_LOCAL = false;
const LAN_HOST = '';
const LOCAL_HOST = LAN_HOST || (Platform.OS === 'android' ? '10.0.2.2' : 'localhost');

const LIVE_URL = 'https://mydiary.mytrustlab.co.in/api/v1';
const LOCAL_URL = `http://${LOCAL_HOST}:8000/api/v1`;

// A release build always uses the live server, whatever USE_LOCAL says.
export const API_BASE_URL = __DEV__ && USE_LOCAL ? LOCAL_URL : LIVE_URL;

// Seconds before a request is given up on.
export const API_TIMEOUT = 20;

