import { addDays, shortDate, TODAY_ISO } from './dates';

// How a recurring task repeats. Same shape as the website.
export type Recurring = {
  freq: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annual';
  days?: number[]; // 0 = Monday … 6 = Sunday (weekly, bi-weekly)
  dayOfMonth?: string; // '1'…'31' or 'last' (monthly, quarterly, annual)
  month?: number; // 1…12 (annual), or the first month (quarterly)
  time?: string; // 'HH:MM'
  endDate?: string; // 'YYYY-MM-DD'
  start?: string; // the day the task was created
};

export const freqLabels: Record<Recurring['freq'], string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  biweekly: 'Bi-weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  annual: 'Annual',
};

export const dayLetters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const monthNames = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export const WEEKDAYS = [0, 1, 2, 3, 4];

const parts = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return {
    y,
    m,
    d,
    weekday: (date.getDay() + 6) % 7, // Monday first
    lastDay: new Date(y, m, 0).getDate(),
    days: Math.round(date.getTime() / 86400000),
  };
};

// Does the task fall on this day?
export function firesOn(rec: Recurring, iso: string): boolean {
  if (rec.endDate && iso > rec.endDate) {
    return false;
  }
  const p = parts(iso);
  const onDay = () => {
    const want = rec.dayOfMonth ?? '1';
    // A day beyond the month's length falls on its last day.
    const day = want === 'last' ? p.lastDay : Math.min(Number(want), p.lastDay);
    return p.d === day;
  };
  switch (rec.freq) {
    case 'daily':
      return true;
    case 'weekly':
      return (rec.days?.length ? rec.days : [4]).includes(p.weekday);
    case 'biweekly': {
      const start = parts(rec.start ?? TODAY_ISO);
      const week = Math.floor((p.days - start.days + start.weekday) / 7);
      return week % 2 === 0 && (rec.days?.length ? rec.days : [4]).includes(p.weekday);
    }
    case 'monthly':
      return onDay();
    case 'quarterly':
      return (p.m - (rec.month ?? 1) + 12) % 3 === 0 && onDay();
    case 'annual':
      return p.m === (rec.month ?? 1) && onDay();
  }
}

// The first occurrence on or after the given day. Looks ahead up to 400 days.
export function occurrenceFrom(rec: Recurring, iso: string): string | null {
  let day = iso;
  for (let i = 0; i < 400; i++) {
    if (rec.endDate && day > rec.endDate) {
      return null;
    }
    if (firesOn(rec, day)) {
      return day;
    }
    day = addDays(day, 1);
  }
  return null;
}

export const occurrenceAfter = (rec: Recurring, iso: string) =>
  occurrenceFrom(rec, addDays(iso, 1));

// "Weekly · Mon, Wed, Fri · 17:00 · until 31 Dec"
export function describe(rec: Recurring): string {
  const bits = [freqLabels[rec.freq]];
  if (rec.freq === 'weekly' || rec.freq === 'biweekly') {
    const days = (rec.days?.length ? rec.days : [4]).slice().sort();
    bits.push(days.map(d => dayNames[d]).join(', '));
  }
  if (rec.freq === 'monthly' || rec.freq === 'quarterly' || rec.freq === 'annual') {
    const day = rec.dayOfMonth === 'last' ? 'last day' : `day ${rec.dayOfMonth ?? '1'}`;
    bits.push(
      rec.freq === 'monthly'
        ? day
        : rec.freq === 'annual'
        ? `${monthNames[(rec.month ?? 1) - 1]}, ${day}`
        : `from ${monthNames[(rec.month ?? 1) - 1]}, ${day}`,
    );
  }
  if (rec.time) {
    bits.push(rec.time);
  }
  if (rec.endDate) {
    bits.push(`until ${shortDate(rec.endDate)}`);
  }
  return bits.join(' · ');
}

export const monthOptions = monthNames.map((label, i) => ({
  id: String(i + 1),
  label,
}));

export const dayOfMonthOptions = [
  ...Array.from({ length: 31 }, (_, i) => ({
    id: String(i + 1),
    label: `Day ${i + 1}`,
  })),
  { id: 'last', label: 'Last day of the month' },
];
