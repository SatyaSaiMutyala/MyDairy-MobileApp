import { baseApi } from './baseApi';
import type { PageMeta } from './labApi';

// Daily Activity Log & Sign-off: one person, one day.
// Shapes exactly as the API sends them.

// pending = not signed yet, overdue = cut-off passed and still not signed,
// signed = signed off in time, late = signed off after the cut-off.
export type ActivityState = 'pending' | 'overdue' | 'signed' | 'late';

export type ActivityItem = {
  text: string;
  category: string | null;
  categoryLabel: string;
  minutes: number;
  time: string;
  ref: string | null;
};

export type ActivityReopen = {
  ts: string | null;
  by: string | null;
  reason: string;
  signedAt: string | null;
};

export type ActivityLog = {
  id: number;
  date: string;
  name: string;
  status: 'draft' | 'submitted';
  state: ActivityState;
  late: boolean;
  submittedAt: string | null;
  submittedOn: string | null;
  totalMinutes: number;
  total: string;
  activities: number;
  items: ActivityItem[];
  pendingForward: string | null;
  remarks: string | null;
  reopens: ActivityReopen[];
};

export type ActivityStats = {
  total: number;
  signed: number;
  late: number;
  pending: number;
  overdue: number;
  minutes: number;
  timeLabel: string;
  scope: string;
};

export type ActivityDay = {
  date: string;
  viewed: {
    id: number;
    name: string;
    dept: string | null;
    deptName: string;
    designation: string | null;
  };
  isSelf: boolean;
  canSeeAll: boolean;
  cutoff: string;
  state: ActivityState;
  locked: boolean;
  editable: boolean;
  canReopen: boolean;
  // null until something has been saved for that day
  log: ActivityLog | null;
  stats: ActivityStats;
};

export type ActivityMeta = {
  categories: { key: string; label: string }[];
  durations: { minutes: number; label: string }[];
  minChars: number;
  maxActivities: number;
  cutoff: string;
};

export type ActivityRowBody = {
  text: string;
  category: string;
  minutes: number;
  ref?: string;
};

export type SaveActivityBody = {
  date: string;
  activities: ActivityRowBody[];
  pending_forward: string;
  remarks: string;
  confirm?: boolean;
  submit?: boolean;
};

export type OverviewRow = {
  userId: number;
  name: string;
  dept: string;
  deptKey: string | null;
  designation: string | null;
  state: ActivityState;
  activities: number;
  time: string;
  minutes: number;
  submittedAt: string | null;
  logId: number | null;
  remarks: string | null;
};

// Empty = today, the signed-in person.
export type DayArg = { date?: string; user?: number };
type HistoryArg = { user?: number; date_from?: string; date_to?: string };
type Paged<T> = { data: T[]; meta: PageMeta };

const nextPage = {
  initialPageParam: 1,
  getNextPageParam: (last: { meta: PageMeta }) =>
    last.meta.page < last.meta.last_page ? last.meta.page + 1 : undefined,
};

// Saving, signing off or reopening changes the day, the history and the
// team overview.
const CHANGED = ['Activity', 'ActivityHistory', 'ActivityOverview'] as const;

export const activityApi = baseApi
  .enhanceEndpoints({ addTagTypes: [...CHANGED] })
  .injectEndpoints({
    endpoints: build => ({
      activityDay: build.query<ActivityDay, DayArg>({
        query: params => ({ url: 'activity', params }),
        providesTags: ['Activity'],
      }),
      activityMeta: build.query<ActivityMeta, void>({
        query: () => 'activity/meta',
        keepUnusedDataFor: 600,
      }),
      saveActivity: build.mutation<
        ActivityDay & { message: string | null },
        SaveActivityBody
      >({
        query: body => ({ url: 'activity', method: 'POST', body }),
        invalidatesTags: [...CHANGED],
      }),
      reopenActivity: build.mutation<ActivityDay, { id: number; reason: string }>(
        {
          query: ({ id, reason }) => ({
            url: `activity/${id}/reopen`,
            method: 'POST',
            body: { reason },
          }),
          invalidatesTags: [...CHANGED],
        },
      ),
      activityHistory: build.infiniteQuery<
        Paged<ActivityLog>,
        HistoryArg,
        number
      >({
        infiniteQueryOptions: nextPage,
        query: ({ queryArg, pageParam }) => ({
          url: 'activity/history',
          params: { ...queryArg, page: pageParam, per_page: 20 },
        }),
        providesTags: ['ActivityHistory'],
      }),
      activityOverview: build.query<
        { date: string; rows: OverviewRow[] },
        { date?: string }
      >({
        query: params => ({ url: 'activity/overview', params }),
        providesTags: ['ActivityOverview'],
      }),
    }),
  });

export const {
  useActivityDayQuery,
  useActivityMetaQuery,
  useSaveActivityMutation,
  useReopenActivityMutation,
  useActivityHistoryInfiniteQuery,
  useActivityOverviewQuery,
} = activityApi;
