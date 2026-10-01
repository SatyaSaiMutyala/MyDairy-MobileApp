import { baseApi } from './baseApi';
import type { PageMeta } from './labApi';

// Pre-Operations and the Daily Report: one department, one day.
// Shapes exactly as the API sends them.

export type DeptInfo = {
  key: string;
  name: string;
  lead: string | null;
  owner: string | null;
  loc: string | null;
};

export type CheckPriority = 'critical' | 'high' | 'standard';
export type PreOpsItem = {
  ref: string;
  text: string;
  priority: CheckPriority;
  done: boolean;
};

export type PreOpsState = {
  department: DeptInfo;
  date: string;
  cutoff: string;
  // none = nothing saved yet today
  status: 'none' | 'draft' | 'submitted';
  locked: boolean;
  submittedBy: string | null;
  submittedAt: string | null;
  remarks: string;
  items: PreOpsItem[];
  done: number;
  total: number;
  canReopen: boolean;
};

export type PreOpsPast = {
  id: number;
  date: string;
  status: 'draft' | 'submitted';
  by: string | null;
  submittedAt: string | null;
  done: number;
  total: number;
  pct: number;
  remarks: string | null;
  items: PreOpsItem[];
};

export type KpiStatus = 'good' | 'amber' | 'red';
export type Importance = 'critical' | 'high' | 'medium' | 'low';

export type ApiKpi = {
  // The KPI's position in the department's list; the key its value is saved under.
  index: number;
  name: string;
  target: string | null;
  frequency: string;
  importance: Importance;
  // due = fill today; event = only if it happened; not_due = another day
  due: 'due' | 'event' | 'not_due';
  nextDue: string | null;
  last: { val: string; status: KpiStatus; date: string } | null;
  value: string;
  status: KpiStatus;
};

export type ReportState = {
  department: DeptInfo;
  date: string;
  // pending = nothing saved yet today
  status: 'pending' | 'draft' | 'submitted';
  locked: boolean;
  savedBy: string | null;
  savedAt: string | null;
  remarks: string;
  kpis: ApiKpi[];
  canReopen: boolean;
};

export type ReportPast = {
  id: number;
  date: string;
  status: 'draft' | 'submitted';
  locked: boolean;
  by: string | null;
  at: string | null;
  filled: number;
  total: number;
  remarks: string | null;
  values: { name: string; val: string; status: KpiStatus }[];
};

type Paged<T> = { data: T[]; meta: PageMeta };
// Empty department = the signed-in person's own.
type Dept = { department?: string };
type HistoryArg = Dept & { date_to?: string };

const nextPage = {
  initialPageParam: 1,
  getNextPageParam: (last: { meta: PageMeta }) =>
    last.meta.page < last.meta.last_page ? last.meta.page + 1 : undefined,
};

export const reportsApi = baseApi
  .enhanceEndpoints({
    addTagTypes: ['PreOps', 'PreOpsHistory', 'Report', 'ReportHistory'],
  })
  .injectEndpoints({
    endpoints: build => ({
      preOps: build.query<PreOpsState, Dept>({
        query: params => ({ url: 'preops', params }),
        providesTags: ['PreOps'],
      }),
      savePreOps: build.mutation<
        PreOpsState,
        Dept & {
          checks: Record<string, boolean>;
          remarks: string;
          submit?: boolean;
        }
      >({
        query: body => ({ url: 'preops', method: 'POST', body }),
        // A draft save writes its answer straight into the cache, so the
        // screen is not refetched while the person is still ticking.
        async onQueryStarted({ department }, { dispatch, queryFulfilled }) {
          try {
            const { data } = await queryFulfilled;
            dispatch(
              reportsApi.util.upsertQueryData(
                'preOps',
                department ? { department } : {},
                data,
              ),
            );
          } catch {}
        },
        invalidatesTags: (_r, _e, a) => (a.submit ? ['PreOpsHistory'] : []),
      }),
      reopenPreOps: build.mutation<PreOpsState, Dept>({
        query: body => ({ url: 'preops/reopen', method: 'POST', body }),
        invalidatesTags: ['PreOps', 'PreOpsHistory'],
      }),
      preOpsHistory: build.infiniteQuery<Paged<PreOpsPast>, HistoryArg, number>(
        {
          infiniteQueryOptions: nextPage,
          query: ({ queryArg, pageParam }) => ({
            url: 'preops/history',
            params: { ...queryArg, page: pageParam, per_page: 20 },
          }),
          providesTags: ['PreOpsHistory'],
        },
      ),

      dailyReport: build.query<ReportState, Dept>({
        query: params => ({ url: 'daily-reports', params }),
        providesTags: ['Report'],
      }),
      saveDailyReport: build.mutation<
        ReportState,
        Dept & {
          kpi_values: Record<string, { val: string; status: KpiStatus }>;
          remarks: string;
          submit?: boolean;
        }
      >({
        query: body => ({ url: 'daily-reports', method: 'POST', body }),
        invalidatesTags: ['Report', 'ReportHistory'],
      }),
      reopenDailyReport: build.mutation<ReportState, Dept>({
        query: body => ({ url: 'daily-reports/reopen', method: 'POST', body }),
        invalidatesTags: ['Report', 'ReportHistory'],
      }),
      dailyReportHistory: build.infiniteQuery<
        Paged<ReportPast>,
        HistoryArg,
        number
      >({
        infiniteQueryOptions: nextPage,
        query: ({ queryArg, pageParam }) => ({
          url: 'daily-reports/history',
          params: { ...queryArg, page: pageParam, per_page: 20 },
        }),
        providesTags: ['ReportHistory'],
      }),
    }),
  });

export const {
  usePreOpsQuery,
  useSavePreOpsMutation,
  useReopenPreOpsMutation,
  usePreOpsHistoryInfiniteQuery,
  useDailyReportQuery,
  useSaveDailyReportMutation,
  useReopenDailyReportMutation,
  useDailyReportHistoryInfiniteQuery,
} = reportsApi;
