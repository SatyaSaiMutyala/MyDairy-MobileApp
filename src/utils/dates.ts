// Small date helpers. Dates are 'YYYY-MM-DD' strings throughout the app.

// The UI round runs on a fixed "today" so the sample data always lines up.
export const TODAY_ISO = '2026-09-29';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const parse = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const pad = (n: number) => String(n).padStart(2, '0');

export const toIso = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const addDays = (iso: string, days: number) => {
  const d = parse(iso);
  d.setDate(d.getDate() + days);
  return toIso(d);
};

export const addMonths = (iso: string, months: number) => {
  const d = parse(iso);
  return toIso(new Date(d.getFullYear(), d.getMonth() + months, 1));
};

export const dayName = (iso: string) => DAYS[parse(iso).getDay()];
export const dayNumber = (iso: string) => String(parse(iso).getDate());
export const monthTitle = (iso: string) => {
  const d = parse(iso);
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

// "Tue, 29 Sep 2026"
export const longDate = (iso: string) => {
  const d = parse(iso);
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`;
};

// "Tue, 29 Sep"
export const shortDate = (iso: string) => longDate(iso).replace(/ \d{4}$/, '');

// The 7 days (Sunday first) of the week that holds the given day.
export const weekOf = (iso: string) => {
  const start = addDays(iso, -parse(iso).getDay());
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
};

// Whole weeks covering the month of the given day.
export const monthGrid = (iso: string) => {
  const d = parse(iso);
  const first = toIso(new Date(d.getFullYear(), d.getMonth(), 1));
  const last = toIso(new Date(d.getFullYear(), d.getMonth() + 1, 0));
  const weeks: string[][] = [];
  let cursor = weekOf(first)[0];
  while (cursor <= last) {
    weeks.push(weekOf(cursor));
    cursor = addDays(cursor, 7);
  }
  return weeks;
};

export const sameMonth = (a: string, b: string) => a.slice(0, 7) === b.slice(0, 7);
export const weekDayNames = DAYS;
