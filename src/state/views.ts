import { useMemo } from 'react';
import type { DiaryEntry, Task, Visit } from '../data/mock';
import { currentUser, seesAllDepartments } from '../data/user';
import { TODAY_ISO } from '../utils/dates';
import { useStore } from './Store';

// What the signed-in person is allowed to see. Same rules as the website:
// a User sees their own rows, Admin and CMD see everyone's.

export function useVisibleTasks(): Task[] {
  const { tasks } = useStore();
  return useMemo(
    () =>
      seesAllDepartments()
        ? tasks
        : tasks.filter(
            t => t.owner === currentUser.name || !!t.from || !!t.escalatedTo,
          ),
    [tasks],
  );
}

export const isMine = (task: Task) => task.owner === currentUser.name;

export function useVisibleVisits(): Visit[] {
  const { visits } = useStore();
  return useMemo(
    () =>
      seesAllDepartments()
        ? visits
        : visits.filter(
            v =>
              v.owner === currentUser.name ||
              v.team.some(m => m.name === currentUser.name),
          ),
    [visits],
  );
}

// One calendar line: an entry, or an invitation that was not declined.
export type DiaryLine = DiaryEntry & {
  invite?: 'pending' | 'accepted' | 'tentative';
};

export function useMyInvites() {
  const { invites } = useStore();
  return useMemo(() => invites.filter(i => i.to === currentUser.name), [invites]);
}

export function useDiaryLines(): DiaryLine[] {
  const { entries } = useStore();
  const invites = useMyInvites();
  return useMemo(() => {
    const mine = seesAllDepartments()
      ? entries
      : entries.filter(
          e =>
            e.owner === currentUser.name ||
            e.attendees?.some(a => a.name === currentUser.name),
        );
    const invited: DiaryLine[] = invites
      .filter(i => i.status !== 'declined')
      .map(i => ({
        id: `invite:${i.id}`,
        owner: i.by,
        date: i.date,
        time: i.time,
        end: i.end,
        kind: 'meeting',
        title: i.title,
        body: `Invited by ${i.by}`,
        place: i.place,
        source: 'Meetings',
        invite: i.status as DiaryLine['invite'],
      }));
    return [...mine, ...invited].sort(
      (a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time),
    );
  }, [entries, invites]);
}

// The next meeting from today onwards, for the Home screen.
export function useNextMeeting(): DiaryLine | undefined {
  const lines = useDiaryLines();
  return lines.find(l => l.kind === 'meeting' && l.date >= TODAY_ISO);
}
