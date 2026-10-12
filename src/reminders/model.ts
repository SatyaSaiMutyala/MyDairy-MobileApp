import type { PillTone } from '../components/Pill';
import type { ApiReminder, ReminderStatus } from '../store/api/remindersApi';
import { addDays, longDate, realToday, shortDate } from '../utils/dates';

export const statusTone: Record<ReminderStatus, PillTone> = {
  scheduled: 'info',
  sent: 'good',
  cancelled: 'low',
};

// "Today · 16:00", "Tomorrow · 09:30", "Tue, 14 Oct · 09:30"
export const whenLabel = (r: Pick<ApiReminder, 'date' | 'time'>) => {
  const today = realToday();
  const day =
    r.date === today
      ? 'Today'
      : r.date === addDays(today, 1)
      ? 'Tomorrow'
      : r.date.slice(0, 4) === today.slice(0, 4)
      ? shortDate(r.date)
      : longDate(r.date);
  return `${day} · ${r.time}`;
};

// "For you", "For Deepak", "For you and Deepak", "For 4 people"
export const forLabel = (r: ApiReminder) => {
  const others = r.recipients.filter(p => !r.forMe || p.userId !== r.creatorId);
  const names = r.recipients.map(p => p.name);
  if (r.forMe && r.mine) {
    const rest = others.filter(p => p.userId !== r.creatorId).map(p => p.name);
    if (!rest.length) {
      return 'For you';
    }
    return rest.length === 1 ? `For you and ${rest[0]}` : `For you and ${rest.length} others`;
  }
  if (names.length <= 2) {
    return `For ${names.join(' and ')}`;
  }
  return `For ${names.length} people`;
};
