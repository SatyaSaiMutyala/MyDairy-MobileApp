import { baseApi } from './baseApi';
import type { PageMeta } from './labApi';

// Shapes exactly as the API sends them.

export type Severity = 'red' | 'amber' | 'green';

export type ApiAlert = {
  id: number;
  dept: string;
  deptName: string;
  severity: Severity;
  text: string;
  // A time or a reference, typed by the person who logged it.
  meta: string | null;
  date: string;
  time: string | null;
  by: string | null;
  source: string;
  escalated: boolean;
  escalatedAt: string | null;
  resolved: boolean;
  resolvedAt: string | null;
  resolvedBy: string | null;
  resolutionNote: string | null;
  mineToAct: boolean;
};

// Each filter is its own query parameter. Empty ones are left out.
export type AlertFilters = {
  status?: 'open' | 'resolved' | 'all';
  date?: string;
  date_from?: string;
  date_to?: string;
  department?: string;
  severity?: Severity;
  escalated?: 1;
  search?: string;
};

export type AlertCounts = {
  red: number;
  amber: number;
  green: number;
  open: number;
  resolved: number;
};

export type AlertPage = {
  data: ApiAlert[];
  meta: PageMeta;
  counts: AlertCounts;
};

export type Department = { key: string; name: string; group: string | null };

export const ALERTS_PER_PAGE = 20;

const one = (r: { alert: ApiAlert }) => r.alert;
const changed = (id?: number) => [
  { type: 'Alerts' as const, id: 'LIST' },
  ...(id ? [{ type: 'Alert' as const, id }] : []),
];

export const alertsApi = baseApi
  .enhanceEndpoints({ addTagTypes: ['Alerts', 'Alert'] })
  .injectEndpoints({
    endpoints: build => ({
      alerts: build.infiniteQuery<AlertPage, AlertFilters, number>({
        infiniteQueryOptions: {
          initialPageParam: 1,
          getNextPageParam: last =>
            last.meta.page < last.meta.last_page
              ? last.meta.page + 1
              : undefined,
        },
        query: ({ queryArg, pageParam }) => ({
          url: 'alerts',
          params: { ...queryArg, page: pageParam, per_page: ALERTS_PER_PAGE },
        }),
        providesTags: [{ type: 'Alerts', id: 'LIST' }],
      }),
      alert: build.query<ApiAlert, number>({
        query: id => `alerts/${id}`,
        transformResponse: one,
        providesTags: (_r, _e, id) => [{ type: 'Alert', id }],
      }),
      // with = only the departments that have morning checks, or KPIs, set up.
      departments: build.query<Department[], { with?: 'preflight' | 'kpis' }>({
        query: params => ({ url: 'departments', params: { per_page: 100, ...params } }),
        transformResponse: (r: { data: Department[] }) => r.data,
        keepUnusedDataFor: 600,
      }),
      raiseAlert: build.mutation<
        ApiAlert,
        {
          department_key?: string;
          severity: Severity;
          text: string;
          meta?: string;
        }
      >({
        query: body => ({ url: 'alerts', method: 'POST', body }),
        transformResponse: one,
        invalidatesTags: () => changed(),
      }),
      escalateAlert: build.mutation<ApiAlert, number>({
        query: id => ({ url: `alerts/${id}/escalate`, method: 'POST' }),
        transformResponse: one,
        invalidatesTags: (_r, _e, id) => changed(id),
      }),
      resolveAlert: build.mutation<ApiAlert, { id: number; note?: string }>({
        query: ({ id, note }) => ({
          url: `alerts/${id}/resolve`,
          method: 'POST',
          body: { note },
        }),
        transformResponse: one,
        invalidatesTags: (_r, _e, { id }) => changed(id),
      }),
    }),
  });

export const {
  useAlertsInfiniteQuery,
  useAlertQuery,
  useDepartmentsQuery,
  useRaiseAlertMutation,
  useEscalateAlertMutation,
  useResolveAlertMutation,
} = alertsApi;
