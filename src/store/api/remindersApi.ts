import { baseApi } from './baseApi';
import type { PageMeta } from './labApi';

// Reminders: a note that fires at a chosen time for chosen people.
// Shapes exactly as the API sends them.

export type ReminderStatus = 'scheduled' | 'sent' | 'cancelled';
export type ReminderBox = 'upcoming' | 'sent' | 'all';

export type ApiReminder = {
  id: number;
  title: string;
  note: string | null;
  remindAt: string; // 'YYYY-MM-DD HH:mm'
  date: string;
  time: string;
  status: ReminderStatus;
  statusLabel: string;
  sentAt: string | null;
  // Its minute has passed but the server has not sent it yet.
  late: boolean;
  creatorId: number;
  creatorName: string;
  mine: boolean;
  forMe: boolean;
  mineToEdit: boolean;
  recipients: { userId: number; name: string }[];
};

export type ReminderFilters = { box?: ReminderBox; search?: string };
export type ReminderCounts = { upcoming: number; sent: number; forMe: number };
export type ReminderPage = {
  data: ApiReminder[];
  meta: PageMeta;
  counts: ReminderCounts;
};

export type ReminderBody = {
  title: string;
  note?: string;
  remind_at: string; // 'YYYY-MM-DD HH:mm'
  recipients: number[];
  remind_me: boolean;
};

export const REMINDERS_PER_PAGE = 20;

const one = (r: { reminder: ApiReminder }) => r.reminder;
const changed = (id?: number) => [
  'Reminders' as const,
  ...(id ? [{ type: 'Reminder' as const, id }] : []),
];

export const remindersApi = baseApi
  .enhanceEndpoints({ addTagTypes: ['Reminders', 'Reminder'] })
  .injectEndpoints({
    endpoints: build => ({
      reminders: build.infiniteQuery<ReminderPage, ReminderFilters, number>({
        infiniteQueryOptions: {
          initialPageParam: 1,
          getNextPageParam: last =>
            last.meta.page < last.meta.last_page
              ? last.meta.page + 1
              : undefined,
        },
        query: ({ queryArg, pageParam }) => ({
          url: 'reminders',
          params: { ...queryArg, page: pageParam, per_page: REMINDERS_PER_PAGE },
        }),
        providesTags: ['Reminders'],
      }),
      reminder: build.query<ApiReminder, number>({
        query: id => `reminders/${id}`,
        transformResponse: one,
        providesTags: (_r, _e, id) => [{ type: 'Reminder', id }],
      }),
      saveReminder: build.mutation<
        ApiReminder,
        { id?: number; body: ReminderBody }
      >({
        query: ({ id, body }) => ({
          url: id ? `reminders/${id}` : 'reminders',
          method: 'POST',
          body,
        }),
        transformResponse: one,
        invalidatesTags: (_r, _e, { id }) => changed(id),
      }),
      deleteReminder: build.mutation<{ ok: true }, number>({
        query: id => ({ url: `reminders/${id}`, method: 'DELETE' }),
        invalidatesTags: ['Reminders'],
      }),
    }),
  });

export const {
  useRemindersInfiniteQuery,
  useReminderQuery,
  useSaveReminderMutation,
  useDeleteReminderMutation,
} = remindersApi;
