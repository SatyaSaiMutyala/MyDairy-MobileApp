import type { ApiKpi, Importance, KpiStatus } from '../store/api/reportsApi';
import { shortDate } from '../utils/dates';

// A KPI line as the Daily Report draws it.
export type Kpi = {
  // The KPI's position in the department's list, as text.
  id: string;
  name: string;
  target?: string;
  frequency: string;
  importance: Importance;
  due: 'today' | 'event' | 'later';
  // e.g. "31 Oct", for a KPI scheduled on another day.
  dueOn?: string;
  // The last submitted figure, offered as a shortcut.
  last?: string;
  lastOn?: string;
};

export type KpiEntry = { value: string; status: KpiStatus };

const dueWord = { due: 'today', event: 'event', not_due: 'later' } as const;

export const toKpi = (k: ApiKpi): Kpi => ({
  id: String(k.index),
  name: k.name,
  target: k.target || undefined,
  frequency: k.frequency,
  importance: k.importance,
  due: dueWord[k.due],
  dueOn: k.nextDue?.replace(/^due /, '') ?? undefined,
  last: k.last?.val,
  lastOn: k.last ? shortDate(k.last.date) : undefined,
});

export const statusWord = {
  good: 'On target',
  amber: 'Watch',
  red: 'Action',
} as const;
