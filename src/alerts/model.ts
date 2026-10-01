import type { ApiAlert, Severity } from '../store/api/alertsApi';
import { realToday, shortDate } from '../utils/dates';

// An alert as the screens draw it.
export type AlertItem = {
  id: number;
  dept: string; // department key
  area: string; // department name
  title: string;
  by: string;
  // A time, or the reference the person typed.
  time: string;
  // 'YYYY-MM-DD' of the day it was logged.
  date: string;
  level: Severity;
  escalated: boolean;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  resolutionNote?: string;
  // Escalate and resolve are for the alert's own department, or Admin/CMD.
  canAct: boolean;
};

// "2026-10-01 11:07" → "11:07" today, "Wed, 30 Sep · 11:07" on other days.
const clock = (at: string | null) => {
  if (!at) {
    return undefined;
  }
  const [day, time = ''] = at.split(' ');
  return day === realToday() ? time : `${shortDate(day)} · ${time}`;
};

export const toAlert = (a: ApiAlert): AlertItem => ({
  id: a.id,
  dept: a.dept,
  area: a.deptName,
  title: a.text,
  by: a.by ?? 'System',
  time: a.meta ?? a.time ?? '',
  date: a.date,
  level: a.severity,
  escalated: a.escalated,
  resolved: a.resolved,
  resolvedBy: a.resolvedBy ?? undefined,
  resolvedAt: clock(a.resolvedAt),
  resolutionNote: a.resolutionNote ?? undefined,
  canAct: a.mineToAct,
});
