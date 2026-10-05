import { PermissionsAndroid, Platform } from 'react-native';
import { createNavigationContainerRef } from '@react-navigation/native';
import type { NoticeLink } from '../store/api/notificationsApi';

// Push notifications through Firebase Cloud Messaging.
//
// The Firebase module is loaded on demand, and every call here fails
// quietly: a phone that cannot receive pushes (a simulator, or one where the
// person said no) simply gets none, and the app works as usual.

export const navigationRef = createNavigationContainerRef<any>();

type Messaging = typeof import('@react-native-firebase/messaging');
const firebase = (): Messaging | null => {
  try {
    return require('@react-native-firebase/messaging');
  } catch {
    return null;
  }
};

// The person is asked before notifications are shown: always on iPhone, and
// on Android 13 and later.
async function allowed(fb: Messaging): Promise<boolean> {
  if (Platform.OS === 'ios') {
    const status = await fb.requestPermission(fb.getMessaging());
    return (
      status === fb.AuthorizationStatus.AUTHORIZED ||
      status === fb.AuthorizationStatus.PROVISIONAL
    );
  }
  if (Number(Platform.Version) < 33) {
    return true;
  }
  const answer = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
  );
  return answer === PermissionsAndroid.RESULTS.GRANTED;
}

// This phone's push address, or null when push is not available or the
// person said no.
export async function pushToken(): Promise<string | null> {
  const fb = firebase();
  if (!fb) {
    return null;
  }
  try {
    if (!(await allowed(fb))) {
      return null;
    }
    return await fb.getToken(fb.getMessaging());
  } catch {
    return null;
  }
}

// Opens what a notification is about. Same targets as the Notifications screen.
export function openLink(link: NoticeLink | null | undefined) {
  if (!link || !navigationRef.isReady()) {
    return;
  }
  const id = link.id;
  switch (link.type) {
    case 'task':
      return navigationRef.navigate('TaskDetail', { id: Number(id) });
    case 'diary':
      return navigationRef.navigate('DiaryEntry', { id: Number(id) });
    case 'visit':
      return navigationRef.navigate('VisitDetail', { id: Number(id) });
    case 'lab':
      return navigationRef.navigate('LabRecord', { id: Number(id) });
    case 'alert':
      return navigationRef.navigate('Alerts');
    case 'preops':
      return navigationRef.navigate('PreOps', { dept: String(id) });
    case 'meeting':
      return navigationRef.navigate('MeetingDetail', { id: Number(id) });
    case 'discussion':
      return navigationRef.navigate('DiscussionDetail', { id: Number(id) });
    case 'project':
      return navigationRef.navigate('ProjectDetail', { id: Number(id) });
    case 'report':
      return navigationRef.navigate('DailyReport', { dept: String(id) });
    case 'activity':
      return navigationRef.navigate('Tabs', {
        screen: 'Activity',
        params: { date: String(id) },
      });
  }
}

type PushData =
  | { kind?: string; link_type?: string; link_id?: string }
  | undefined;
const linkOf = (data: PushData): NoticeLink | null =>
  data?.link_type && data.link_id
    ? { type: data.link_type as NoticeLink['type'], id: data.link_id }
    : null;

type Handlers = {
  // A push arrived while the app is open: refresh what it is about.
  onArrive: (kind?: string) => void;
  // Firebase gave this phone a new address.
  onNewToken: (token: string) => void;
};

// Starts listening. Returns a function that stops it.
export function listenForPushes({
  onArrive,
  onNewToken,
}: Handlers): () => void {
  const fb = firebase();
  if (!fb) {
    return () => {};
  }
  const m = fb.getMessaging();
  const stops = [
    fb.onMessage(m, async msg => onArrive((msg?.data as PushData)?.kind)),
    fb.onTokenRefresh(m, onNewToken),
    // Tapped while the app was in the background.
    fb.onNotificationOpenedApp(m, msg => {
      onArrive((msg?.data as PushData)?.kind);
      openLink(linkOf(msg?.data as PushData));
    }),
  ];
  // Tapped while the app was closed: it opened the app.
  fb.getInitialNotification(m)
    .then(msg => {
      if (msg) {
        // Give the first screen a moment to mount.
        setTimeout(() => openLink(linkOf(msg.data as PushData)), 600);
      }
    })
    .catch(() => {});
  return () => stops.forEach(stop => stop());
}

// Android needs a handler registered for pushes that arrive while the app is
// not running. The system shows the notification itself; nothing to do here.
export function registerBackgroundHandler() {
  const fb = firebase();
  if (fb) {
    fb.setBackgroundMessageHandler(fb.getMessaging(), async () => {});
  }
}
