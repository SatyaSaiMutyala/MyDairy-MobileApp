import { Platform } from 'react-native';
import notifee, {
  AndroidCategory,
  AndroidFlags,
  AndroidImportance,
  AndroidNotificationSetting,
  EventType,
  TriggerType,
  type Event,
  type TimestampTrigger,
} from '@notifee/react-native';
import { navigationRef } from '../push';
import type { ApiReminder } from '../store/api/remindersApi';

/**
 * Reminders ring like an alarm.
 *
 * A push alone shows a quiet banner, so the phone itself schedules a local
 * alarm for every reminder set for this person. At the minute it rings for
 * up to two minutes, or until Stop is tapped or the reminder is opened.
 *
 * Android: one notification whose sound loops (FLAG_INSISTENT) and times out
 * after two minutes, shown over the lock screen.
 * iPhone: a sound may play for 30 seconds at most, so four notifications are
 * booked 30 seconds apart; stopping one cancels the rest.
 */

const CHANNEL = 'reminders';
const PREFIX = 'rem';
const RING_MS = 120_000;
const IOS_REPEATS = 4;
const IOS_GAP_MS = 30_000;

// 'YYYY-MM-DD HH:mm' in the phone's own time zone.
const toDate = (remindAt: string) => {
  const [d, t] = remindAt.split(' ');
  const [y, m, day] = d.split('-').map(Number);
  const [h, min] = (t ?? '00:00').split(':').map(Number);
  return new Date(y, m - 1, day, h, min, 0, 0);
};

const idFor = (reminder: ApiReminder, k: number) =>
  `${PREFIX}${reminder.id}-${Math.floor(toDate(reminder.remindAt).getTime() / 60000)}-${k}`;

const reminderIdOf = (notificationId?: string) => {
  const m = notificationId?.match(/^rem(\d+)-/);
  return m ? Number(m[1]) : null;
};

let prepared = false;

// Channel, categories and permissions. Safe to call more than once.
export async function prepareAlarms(): Promise<void> {
  if (prepared) {
    return;
  }
  prepared = true;
  try {
    await notifee.requestPermission();
    if (Platform.OS === 'android') {
      await notifee.createChannel({
        id: CHANNEL,
        name: 'Reminders',
        description: 'Rings like an alarm when a reminder is due',
        importance: AndroidImportance.HIGH,
        sound: 'alarm',
        vibration: true,
        vibrationPattern: [300, 500],
        bypassDnd: true,
      });
    } else {
      await notifee.setNotificationCategories([
        { id: 'reminder', actions: [{ id: 'stop', title: 'Stop', foreground: false }] },
      ]);
    }
  } catch {
    // Without permission the server push still shows a plain notification.
  }
}

// Android 12+: exact alarms need a switch in Settings, asked once.
async function ensureExactAlarms(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }
  try {
    const settings = await notifee.getNotificationSettings();
    if (settings.android.alarm !== AndroidNotificationSetting.ENABLED) {
      await notifee.openAlarmPermissionSettings();
    }
  } catch {
    // Older Android: no such setting.
  }
}

// Books (or re-books) the alarms for every reminder set for this person, and
// drops the ones that were changed or cancelled.
export async function syncAlarms(reminders: ApiReminder[]): Promise<void> {
  await prepareAlarms();
  const now = Date.now();
  const wanted = reminders.filter(
    r => r.forMe && r.status === 'scheduled' && toDate(r.remindAt).getTime() > now - 60_000,
  );
  if (wanted.length) {
    await ensureExactAlarms();
  }

  const repeats = Platform.OS === 'ios' ? IOS_REPEATS : 1;
  const keep = new Set<string>();
  for (const r of wanted) {
    for (let k = 0; k < repeats; k++) {
      keep.add(idFor(r, k));
    }
  }

  let existing: string[] = [];
  try {
    existing = await notifee.getTriggerNotificationIds();
  } catch {
    existing = [];
  }
  const stale = existing.filter(id => id.startsWith(PREFIX) && !keep.has(id));
  if (stale.length) {
    await notifee.cancelTriggerNotifications(stale);
  }
  const have = new Set(existing);

  for (const r of wanted) {
    const at = toDate(r.remindAt).getTime();
    const title = r.mine ? `Reminder: ${r.title}` : `${r.creatorName} reminds you: ${r.title}`;
    const body = r.note?.trim() || `Set for ${r.time}`;
    for (let k = 0; k < repeats; k++) {
      const id = idFor(r, k);
      const when = at + k * IOS_GAP_MS;
      if (have.has(id) || when <= now) {
        continue;
      }
      const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: when,
        alarmManager: { allowWhileIdle: true },
      };
      try {
        await notifee.createTriggerNotification(
          {
            id,
            title,
            body,
            data: { reminderId: String(r.id) },
            android: {
              channelId: CHANNEL,
              category: AndroidCategory.ALARM,
              importance: AndroidImportance.HIGH,
              sound: 'alarm',
              loopSound: true,
              flags: [AndroidFlags.FLAG_INSISTENT],
              timeoutAfter: RING_MS,
              autoCancel: true,
              pressAction: { id: 'default', launchActivity: 'default' },
              fullScreenAction: { id: 'default', launchActivity: 'default' },
              actions: [{ title: 'Stop', pressAction: { id: 'stop' } }],
            },
            ios: {
              sound: 'alarm.wav',
              interruptionLevel: 'timeSensitive',
              categoryId: 'reminder',
            },
          },
          trigger,
        );
      } catch {
        // One bad booking must not stop the others.
      }
    }
  }
}

// Silence a ringing reminder and drop its remaining repeats.
export async function stopAlarm(reminderId: number): Promise<void> {
  try {
    const [displayed, pending] = await Promise.all([
      notifee.getDisplayedNotifications(),
      notifee.getTriggerNotificationIds(),
    ]);
    const mine = (id?: string) => reminderIdOf(id) === reminderId;
    for (const n of displayed) {
      if (mine(n.id)) {
        await notifee.cancelDisplayedNotification(n.id as string);
      }
    }
    const rest = pending.filter(id => mine(id));
    if (rest.length) {
      await notifee.cancelTriggerNotifications(rest);
    }
  } catch {
    // Nothing to stop.
  }
}

// What to do when a ringing reminder is tapped or its Stop is pressed.
export async function handleAlarmEvent({ type, detail }: Event): Promise<void> {
  const id = reminderIdOf(detail.notification?.id);
  if (!id) {
    return;
  }
  if (type === EventType.ACTION_PRESS || type === EventType.DISMISSED) {
    await stopAlarm(id);
  } else if (type === EventType.PRESS) {
    await stopAlarm(id);
    if (navigationRef.isReady()) {
      navigationRef.navigate('ReminderDetail', { id });
    }
  }
}

// Registered once at app start, for events while the app is not open.
export function registerAlarmHandlers(): void {
  notifee.onBackgroundEvent(handleAlarmEvent);
}
