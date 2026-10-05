import type { PillTone } from '../components/Pill';
import type { ApiMeeting, Attendance, MeetingStatus } from '../store/api/meetingsApi';
import { realToday, shortDate } from '../utils/dates';

// Labels and colours the meeting screens share.

export const statusTone: Record<MeetingStatus, PillTone> = {
  draft: 'low',
  scheduled: 'info',
  inprogress: 'watch',
  completed: 'signed',
  cancelled: 'critical',
};

export const attendanceTone: Record<Attendance, PillTone> = {
  present: 'good',
  absent: 'critical',
  late: 'watch',
};

export const agendaTone: Record<string, PillTone> = {
  info: 'info',
  decision: 'critical',
  discuss: 'teal',
  update: 'watch',
  action: 'good',
};

// "Mon, 5 Oct · 11:00 – 11:45", or "Today · 11:00 – 11:45"
export const whenLabel = (m: ApiMeeting) => {
  const day = m.date ? (m.date === realToday() ? 'Today' : shortDate(m.date)) : 'No date';
  if (!m.time) {
    return day;
  }
  return `${day} · ${m.time}${m.endTime ? ` – ${m.endTime}` : ''}`;
};

export const minutesLabel = (n: number) =>
  n >= 60 ? `${Math.floor(n / 60)} h${n % 60 ? ` ${n % 60} min` : ''}` : `${n} min`;
