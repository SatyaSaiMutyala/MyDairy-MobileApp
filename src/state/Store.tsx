import React, { createContext, useContext, useMemo, useState } from 'react';
import {
  AlertItem,
  alerts as seedAlerts,
  DiaryEntry,
  diaryEntries as seedEntries,
  Escalation,
  Invite,
  InviteResponse,
  invites as seedInvites,
  Task,
  tasks as seedTasks,
  Visit,
  visits as seedVisits,
} from '../data/mock';
import { currentUser } from '../data/user';
import { shortDate, TODAY_ISO } from '../utils/dates';
import { occurrenceAfter } from '../utils/recur';

// In-memory data for the UI round. Every function here becomes an API call later.

export type KpiEntry = { value: string; status: 'good' | 'amber' | 'red' };

type Preflight = {
  checks: Record<string, boolean>;
  remarks: string;
  submittedAt: string | null;
  submittedBy: string | null;
};

type Report = {
  entries: Record<string, KpiEntry>;
  remarks: string;
  status: 'pending' | 'draft' | 'submitted';
  savedAt: string | null;
  savedBy: string | null;
};

type Store = {
  tasks: Task[];
  toggleTask: (id: string) => void;
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: string, change: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  escalateTask: (id: string, toName: string, escalation: Escalation) => void;
  // Answer a task a colleague escalated to me; it goes back to them.
  resolveTask: (id: string) => void;

  alerts: AlertItem[];
  addAlert: (alert: Omit<AlertItem, 'id'>) => void;
  resolveAlert: (id: string, note?: string) => void;
  escalateAlert: (id: string) => void;

  entries: DiaryEntry[];
  // Creates the entry, or replaces it when an id is given.
  saveEntry: (entry: Omit<DiaryEntry, 'id'>, id?: string) => void;
  deleteEntry: (id: string) => void;
  invites: Invite[];
  respondInvite: (id: string, response: InviteResponse) => void;

  visits: Visit[];
  // Creates the visit, or replaces it when an id is given.
  saveVisit: (visit: Omit<Visit, 'id'>, id?: string) => void;
  submitVisit: (id: string) => void;
  reviewVisit: (id: string) => void;
  deleteVisit: (id: string) => void;

  // Pre-Operations and Daily Report are kept per department.
  preflightOf: (dept: string) => Preflight;
  setPreflight: (dept: string, change: Partial<Preflight>) => void;
  reportOf: (dept: string) => Report;
  setReport: (dept: string, change: Partial<Report>) => void;
};

const emptyPreflight: Preflight = {
  checks: {},
  remarks: '',
  submittedAt: null,
  submittedBy: null,
};
const emptyReport: Report = {
  entries: {},
  remarks: '',
  status: 'pending',
  savedAt: null,
  savedBy: null,
};

const StoreContext = createContext<Store | null>(null);

let counter = 0;
const newId = (prefix: string) => `${prefix}-new-${++counter}`;

export const clockNow = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(seedTasks);
  const [alerts, setAlerts] = useState<AlertItem[]>(seedAlerts);
  const [entries, setEntries] = useState<DiaryEntry[]>(seedEntries);
  const [invites, setInvites] = useState<Invite[]>(seedInvites);
  const [visits, setVisits] = useState<Visit[]>(seedVisits);
  const [preflights, setPreflights] = useState<Record<string, Preflight>>({});
  const [reports, setReports] = useState<Record<string, Report>>({});

  // Action items given to me become tasks once the visit is submitted.
  const pushActions = (visit: Omit<Visit, 'id'>) => {
    const mine = visit.actions.filter(a => a.assignee === 'me' && !a.done);
    if (!mine.length) {
      return;
    }
    setTasks(list => {
      const fresh = mine.filter(a => !list.some(t => t.title === a.text));
      return [
        ...fresh.map(a => ({
          id: newId('t'),
          owner: currentUser.name,
          title: a.text,
          description: `Action from visit: ${visit.title}`,
          priority: a.priority,
          area: 'Visit',
          due: a.due ? shortDate(a.due) : 'No date',
          dueDate: a.due || undefined,
          bucket: 'upcoming' as const,
          tags: ['visit'],
        })),
        ...list,
      ];
    });
  };

  const value = useMemo<Store>(
    () => ({
      tasks,
      toggleTask: id =>
        setTasks(list =>
          list.map(t => {
            if (t.id !== id) {
              return t;
            }
            // A recurring task is never finished: ticking it moves it on
            // to the next occurrence.
            if (t.recurring && !t.done) {
              const current = t.dueDate ?? TODAY_ISO;
              const next = occurrenceAfter(t.recurring, current);
              if (!next) {
                // Past the end date: the recurrence is finished.
                return { ...t, done: true, lastDone: `Today, ${clockNow()}` };
              }
              return {
                ...t,
                dueDate: next,
                bucket: next <= TODAY_ISO ? 'today' : 'upcoming',
                overdue: next < TODAY_ISO,
                due: next === TODAY_ISO ? t.recurring.time ?? 'Today' : `Next: ${shortDate(next)}`,
                lastDone: `${shortDate(current)} · ticked ${clockNow()}`,
              };
            }
            return { ...t, done: !t.done };
          }),
        ),
      updateTask: (id, change) =>
        setTasks(list => list.map(t => (t.id === id ? { ...t, ...change } : t))),
      deleteTask: id => setTasks(list => list.filter(t => t.id !== id)),
      resolveTask: id => setTasks(list => list.filter(t => t.id !== id)),
      addTask: task => setTasks(list => [{ ...task, id: newId('t') }, ...list]),
      escalateTask: (id, toName, escalation) =>
        setTasks(list =>
          list.map(t =>
            t.id === id
              ? { ...t, escalatedTo: toName, escalation, returned: undefined }
              : t,
          ),
        ),

      alerts,
      addAlert: alert =>
        setAlerts(list => [{ ...alert, id: newId('a') }, ...list]),
      resolveAlert: (id, note) =>
        setAlerts(list =>
          list.map(a =>
            a.id === id
              ? {
                  ...a,
                  resolved: true,
                  resolvedBy: currentUser.name,
                  resolvedAt: clockNow(),
                  resolutionNote: note?.trim() || undefined,
                }
              : a,
          ),
        ),
      escalateAlert: id =>
        setAlerts(list =>
          list.map(a => (a.id === id ? { ...a, escalated: true } : a)),
        ),

      entries,
      saveEntry: (entry, id) =>
        setEntries(list =>
          id
            ? list.map(e => (e.id === id ? { ...entry, id } : e))
            : [...list, { ...entry, id: newId('d') }],
        ),
      deleteEntry: id => setEntries(list => list.filter(e => e.id !== id)),
      invites,
      respondInvite: (id, response) =>
        setInvites(list =>
          list.map(i => (i.id === id ? { ...i, status: response } : i)),
        ),

      visits,
      saveVisit: (visit, id) => {
        setVisits(list =>
          id
            ? list.map(v => (v.id === id ? { ...visit, id } : v))
            : [{ ...visit, id: newId('v') }, ...list],
        );
        if (visit.status !== 'draft') {
          pushActions(visit);
        }
      },
      submitVisit: id => {
        const visit = visits.find(v => v.id === id);
        if (!visit) {
          return;
        }
        setVisits(list =>
          list.map(v =>
            v.id === id
              ? { ...v, status: 'submitted', submittedOn: `Today · ${clockNow()}` }
              : v,
          ),
        );
        pushActions(visit);
      },
      reviewVisit: id =>
        setVisits(list =>
          list.map(v =>
            v.id === id
              ? { ...v, status: 'reviewed', reviewedBy: currentUser.name }
              : v,
          ),
        ),
      deleteVisit: id => setVisits(list => list.filter(v => v.id !== id)),

      preflightOf: dept => preflights[dept] ?? emptyPreflight,
      setPreflight: (dept, change) =>
        setPreflights(all => ({
          ...all,
          [dept]: { ...(all[dept] ?? emptyPreflight), ...change },
        })),
      reportOf: dept => reports[dept] ?? emptyReport,
      setReport: (dept, change) =>
        setReports(all => ({
          ...all,
          [dept]: { ...(all[dept] ?? emptyReport), ...change },
        })),
    }),
     
    [tasks, alerts, entries, invites, visits, preflights, reports],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const store = useContext(StoreContext);
  if (!store) {
    throw new Error('useStore must be used inside StoreProvider');
  }
  return store;
}
