import type {
  ApiDiaryEntry,
  ApiInvite,
  DiaryType,
  InviteResponse,
} from '../store/api/diaryApi';

export type { InviteResponse };
export type DiaryKind = DiaryType;
export type Attendee = { id: number; name: string; status: InviteResponse };

// One calendar line as the screens draw it.
export type DiaryLine = {
  id: number;
  date: string; // YYYY-MM-DD
  time: string; // '09:40' or 'All day'
  end?: string;
  kind: DiaryKind;
  title: string;
  body: string;
  // Who the entry belongs to.
  owner: string;
  mine: boolean;
  place?: string;
  attendees: Attendee[];
  // The module the entry came from. Such entries cannot be changed here.
  source?: string;
  canEdit: boolean;
  // My own invitation, when a colleague tagged me on the entry.
  invite?: InviteResponse;
  inviteId?: number;
  agenda: { title: string; owner: string; duration: number; notes: string }[];
};

export const toLine = (e: ApiDiaryEntry): DiaryLine => ({
  id: e.id,
  date: e.date,
  time: e.allDay ? 'All day' : e.startTime ?? 'Any time',
  end: e.allDay ? undefined : e.endTime ?? undefined,
  kind: e.type,
  title: e.title,
  body: e.notes ?? '',
  owner: e.ownerName,
  mine: e.isOwner,
  place: e.location ?? undefined,
  attendees: e.invitees,
  source: e.origin ?? undefined,
  canEdit: e.mineToEdit,
  invite: e.myInvite?.status,
  inviteId: e.myInvite?.id,
  agenda: e.agenda ?? [],
});

// An invitation waiting in my list.
export type Invite = {
  id: number;
  entryId: number;
  title: string;
  date: string;
  time: string;
  end?: string;
  place?: string;
  by: string;
  status: InviteResponse;
};

export const toInvite = (i: ApiInvite): Invite => ({
  id: i.inviteId,
  entryId: i.entryId,
  title: i.title,
  date: i.date,
  time: i.allDay ? 'All day' : i.startTime ?? 'Any time',
  end: i.allDay ? undefined : i.endTime ?? undefined,
  place: i.location ?? undefined,
  by: i.invitedBy,
  status: i.status,
});

export const diaryTypes: { id: DiaryKind; label: string }[] = [
  { id: 'appointment', label: 'Appointment' },
  { id: 'focus', label: 'Focus / Deep work' },
  { id: 'reminder', label: 'Reminder' },
  { id: 'event', label: 'Event' },
  { id: 'meeting', label: 'Meeting' },
  { id: 'task', label: 'Task' },
];
