import type { PillTone } from '../components/Pill';
import type {
  ActivityItem,
  ActivityRowBody,
  ActivityState,
} from '../store/api/activityApi';
import { colors } from '../theme';

// A day's activity log as the screens draw it.

export const stateLabel: Record<ActivityState, string> = {
  pending: 'Not signed yet',
  overdue: 'Overdue',
  signed: 'Signed off',
  late: 'Signed off late',
};

export const stateTone: Record<ActivityState, PillTone> = {
  pending: 'low',
  overdue: 'critical',
  signed: 'good',
  late: 'watch',
};

export const stateColor: Record<ActivityState, string> = {
  pending: colors.inkFaint,
  overdue: colors.red,
  signed: colors.green,
  late: colors.amber,
};

// One activity while it is being typed.
export type Draft = {
  key: string;
  text: string;
  category: string; // '' = not picked
  minutes: number; // 0 = not picked
  ref: string;
};

let seq = 0;
export const blankRow = (): Draft => ({
  key: `new-${Date.now()}-${seq++}`,
  text: '',
  category: '',
  minutes: 0,
  ref: '',
});

export const rowsFrom = (items: ActivityItem[]): Draft[] =>
  items.map((i, n) => ({
    key: `saved-${n}`,
    text: i.text,
    category: i.category ?? '',
    minutes: i.minutes,
    ref: i.ref ?? '',
  }));

// What goes to the server. A row with no text is not an activity.
export const toBody = (rows: Draft[]): ActivityRowBody[] =>
  rows
    .filter(r => r.text.trim())
    .map(r => ({
      text: r.text.trim(),
      category: r.category,
      minutes: r.minutes,
      ref: r.ref.trim() || undefined,
    }));

// 90 → "1h 30m"
export const minutesLabel = (minutes: number) => {
  if (minutes <= 0) {
    return '0m';
  }
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h && m ? `${h}h ${m}m` : h ? `${h}h` : `${m}m`;
};

// The same gates the server applies before a sign-off, so the person sees
// what is missing before they tap. null = ready to sign.
export function problem(
  rows: Draft[],
  confirmed: boolean,
  minChars: number,
): string | null {
  const filled = rows.filter(r => r.text.trim());
  if (!filled.length) {
    return 'Add at least one activity before signing off.';
  }
  for (let i = 0; i < filled.length; i++) {
    const r = filled[i];
    const n = i + 1;
    if (r.text.trim().length < minChars) {
      return `Activity ${n} needs a fuller description, at least ${minChars} characters.`;
    }
    if (!r.category) {
      return `Activity ${n} needs a category.`;
    }
    if (r.minutes <= 0) {
      return `Activity ${n} needs the time it took.`;
    }
  }
  if (!confirmed) {
    return 'Tick the confirmation before signing off.';
  }
  return null;
}
