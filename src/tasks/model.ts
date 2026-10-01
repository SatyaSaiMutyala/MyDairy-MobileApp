import type { Priority } from '../data/mock';
import type { ApiPriority, ApiTask, TaskBox } from '../store/api/tasksApi';
import type { PickedFile } from '../utils/files';
import { realToday, shortDate } from '../utils/dates';
import { freqLabels, Recurring } from '../utils/recur';

// A task as the screens draw it: the API's task with its labels worked out.

export type Escalation = {
  reason: string;
  note?: string;
  expectedBy?: string;
  on: string;
};

export type Resolution = {
  by: string;
  action: string;
  note: string;
  on: string;
};

export type Task = {
  id: number;
  box: TaskBox;
  // Who the task belongs to.
  owner: string;
  title: string;
  description?: string;
  priority: Priority;
  // Department key and name.
  category: string;
  area: string;
  // Location code and name.
  location?: string;
  place?: string;
  tags: string[];
  hard: boolean;
  // What to print for the deadline, e.g. "17:30", "Fri, 2 Oct", "Next: Fri, 2 Oct".
  due: string;
  dueDate?: string;
  dueTime?: string;
  overdue: boolean;
  // Ticked: finished, or a recurring task already done for now.
  done: boolean;
  // Short label of how it repeats, e.g. 'Weekly'.
  repeat?: string;
  recurring?: Recurring;
  // Recurring tasks: when the last occurrence was ticked.
  lastDone?: string;
  attachments: PickedFile[];
  canEdit: boolean;
  canDelete: boolean;
  // Set while the task is with a colleague (shown in Escalated out).
  escalatedTo?: string;
  // Set when a colleague escalated this task to me (shown in Inbox).
  from?: string;
  escalation?: Escalation;
  // Set when the colleague answered and the task came back to me.
  returned?: Resolution;
};

const priorityNames: Record<ApiPriority, Priority> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export const apiPriority = (p: Priority) => p.toLowerCase() as ApiPriority;

// "2026-10-01 11:07" → "Today, 11:07" or "Wed, 30 Sep · 11:07"
export const stamp = (at?: string | null) => {
  if (!at) {
    return '';
  }
  const [day, time = ''] = at.split(' ');
  return day === realToday() ? `Today, ${time}` : `${shortDate(day)} · ${time}`;
};

// Files already on the task carry this prefix, to tell them from new picks.
const SAVED = 'saved-';
export const savedId = (file: PickedFile) =>
  file.id.startsWith(SAVED) ? Number(file.id.slice(SAVED.length)) : null;

const dueLabel = (t: ApiTask) => {
  if (!t.due) {
    return 'No date';
  }
  const time = t.dueTime ?? t.recurring?.time;
  if (t.doneForNow) {
    return `Next: ${shortDate(t.due)}`;
  }
  if (t.due === realToday() && !t.done) {
    return time ?? 'Today';
  }
  return time ? `${shortDate(t.due)} · ${time}` : shortDate(t.due);
};

export function toTask(t: ApiTask): Task {
  const open = t.escalation;
  const back = t.returned;
  return {
    id: t.id,
    box: t.box,
    owner: t.ownerName,
    title: t.title,
    description: t.description || undefined,
    priority: priorityNames[t.priority] ?? 'Medium',
    category: t.category,
    area: t.categoryName,
    location: t.location ?? undefined,
    place: t.locationName ?? undefined,
    tags: t.tags ?? [],
    hard: t.hard,
    due: dueLabel(t),
    dueDate: t.dueDate ?? undefined,
    dueTime: t.dueTime ?? undefined,
    overdue: t.overdue,
    done: t.done || t.doneForNow,
    repeat: t.recurring ? freqLabels[t.recurring.freq] : undefined,
    recurring: t.recurring ?? undefined,
    lastDone: t.lastDone?.date
      ? `${shortDate(t.lastDone.date)} · ticked ${stamp(t.lastDone.at)}`
      : undefined,
    attachments: t.attachments.map(a => ({
      id: `${SAVED}${a.id}`,
      name: a.name,
      uri: a.url ?? '',
      size: a.bytes,
      type: a.mime ?? '',
    })),
    canEdit: t.mineToEdit && t.box === 'mine',
    canDelete: t.mineToDelete && t.box === 'mine',
    escalatedTo: t.box === 'out' ? open?.toName ?? t.assigneeName : undefined,
    from: t.box === 'inbox' ? open?.fromName ?? t.ownerName : undefined,
    escalation: open
      ? {
          reason: open.reasonLabel,
          note: open.note ?? undefined,
          expectedBy: open.expectBy ? shortDate(open.expectBy) : undefined,
          on: stamp(open.at),
        }
      : back
      ? {
          reason: back.reasonLabel,
          note: back.askNote ?? undefined,
          on: stamp(back.askedAt),
        }
      : undefined,
    returned: back
      ? {
          by: back.byName,
          action: back.actionLabel,
          note: back.note,
          on: stamp(back.at),
        }
      : undefined,
  };
}

export type TaskDraft = {
  title: string;
  description: string;
  priority: Priority;
  category: string;
  location: string; // '' = no location
  tags: string[];
  hard: boolean;
  // One-time tasks only.
  dueDate: string;
  dueTime: string;
  recurring?: Recurring;
  newFiles: PickedFile[];
  removedFileIds: number[];
};

// The same fields the website's task form posts.
export function taskForm(d: TaskDraft): FormData {
  const form = new FormData();
  form.append('title', d.title.trim());
  form.append('description', d.description.trim());
  form.append('priority', apiPriority(d.priority));
  form.append('category', d.category);
  form.append('location', d.location);
  // A recurring task has no deadline of its own: it is due on its occurrences.
  form.append('due_date', d.recurring ? '' : d.dueDate);
  form.append('due_time', d.recurring ? '' : d.dueTime);
  form.append('hard_deadline', d.hard ? '1' : '0');
  d.tags.forEach(tag => form.append('tags[]', tag));

  const r = d.recurring;
  if (r) {
    form.append('recurring[freq]', r.freq);
    if (r.endDate) {
      form.append('recurring[endDate]', r.endDate);
    }
    if (r.time) {
      form.append('recurring[time]', r.time);
    }
    if (r.freq === 'weekly' || r.freq === 'biweekly') {
      (r.days ?? []).forEach(day =>
        form.append('recurring[days][]', String(day)),
      );
    }
    if (r.freq === 'monthly' || r.freq === 'quarterly' || r.freq === 'annual') {
      form.append('recurring[dayOfMonth]', r.dayOfMonth ?? '1');
    }
    if (r.freq === 'quarterly' || r.freq === 'annual') {
      form.append('recurring[month]', String(r.month ?? 1));
    }
  }

  d.newFiles.forEach(f =>
    form.append('attachments[]', {
      uri: f.uri,
      name: f.name,
      type: f.type || 'application/octet-stream',
    } as unknown as Blob),
  );
  d.removedFileIds.forEach(id =>
    form.append('removed_attachment_ids[]', String(id)),
  );
  return form;
}
