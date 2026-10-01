import { baseApi } from './baseApi';
import type { PageMeta } from './labApi';
import type { ApiPriority } from './tasksApi';

// Shapes exactly as the API sends them.

export type VisitStatus = 'draft' | 'submitted' | 'reviewed' | 'closed';

export type ApiVisit = {
  id: number;
  title: string;
  type: string;
  status: VisitStatus;
  date: string;
  timeIn: string | null;
  timeOut: string | null;
  org: string | null;
  branch: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  gps: string | null;
  hostName: string | null;
  hostTitle: string | null;
  hostPhone: string | null;
  hostEmail: string | null;
  external: string | null;
  purpose: string | null;
  scope: string | null;
  refs: string | null;
  tags: string[];
  ratings: Record<string, number>;
  assessment: string | null;
  summary: string | null;
  followUp: string;
  nextVisit: string | null;
  remarks: string | null;
  ownerId: number;
  ownerName: string;
  submittedAt: string | null;
  reviewedAt: string | null;
  reviewedBy: string | null;
  mineToEdit: boolean;
  mineToDelete: boolean;
  mineToReview: boolean;
  team: { id: number; userId: number | null; name: string; lead: boolean }[];
  observations: {
    id: number;
    category: string;
    text: string;
    evidence: string | null;
  }[];
  actions: {
    id: number;
    text: string;
    assigneeId: number | null;
    assignee: string | null;
    due: string | null;
    priority: ApiPriority;
    done: boolean;
    // Set once the visit is submitted and the action became a task.
    taskId: number | null;
  }[];
  photos: { id: number; name: string; url: string | null }[];
};

// Each filter is its own query parameter. Empty ones are left out.
export type VisitFilters = {
  search?: string;
  type?: string;
  status?: VisitStatus;
  date_from?: string;
  date_to?: string;
  sort?: 'recent' | 'oldest';
};

export type VisitCounts = { total: number; openActions: number; ncs: number };
export type VisitPage = {
  data: ApiVisit[];
  meta: PageMeta;
  counts: VisitCounts;
};

export const VISITS_PER_PAGE = 20;

const one = (r: { visit: ApiVisit }) => r.visit;
// A submitted visit creates tasks and a diary block, so those lists refresh too.
const changed = (id?: number) => [
  'Visits' as const,
  'Tasks' as const,
  'Diary' as const,
  ...(id ? [{ type: 'Visit' as const, id }] : []),
];

export const visitsApi = baseApi
  .enhanceEndpoints({ addTagTypes: ['Visits', 'Visit', 'Tasks', 'Diary'] })
  .injectEndpoints({
    endpoints: build => ({
      visits: build.infiniteQuery<VisitPage, VisitFilters, number>({
        infiniteQueryOptions: {
          initialPageParam: 1,
          getNextPageParam: last =>
            last.meta.page < last.meta.last_page
              ? last.meta.page + 1
              : undefined,
        },
        query: ({ queryArg, pageParam }) => ({
          url: 'visits',
          params: { ...queryArg, page: pageParam, per_page: VISITS_PER_PAGE },
        }),
        providesTags: ['Visits'],
      }),
      visit: build.query<ApiVisit, number>({
        query: id => `visits/${id}`,
        transformResponse: one,
        providesTags: (_r, _e, id) => [{ type: 'Visit', id }],
      }),
      // Create when there is no id, otherwise replace the draft.
      saveVisit: build.mutation<ApiVisit, { id?: number; form: FormData }>({
        query: ({ id, form }) => ({
          url: id ? `visits/${id}` : 'visits',
          method: 'POST',
          body: form,
        }),
        transformResponse: one,
        invalidatesTags: (_r, _e, { id }) => changed(id),
      }),
      deleteVisit: build.mutation<{ ok: true }, number>({
        query: id => ({ url: `visits/${id}`, method: 'DELETE' }),
        invalidatesTags: ['Visits', 'Diary'],
      }),
      submitVisit: build.mutation<ApiVisit, number>({
        query: id => ({ url: `visits/${id}/submit`, method: 'POST' }),
        transformResponse: one,
        invalidatesTags: (_r, _e, id) => changed(id),
      }),
      reviewVisit: build.mutation<ApiVisit, number>({
        query: id => ({ url: `visits/${id}/review`, method: 'POST' }),
        transformResponse: one,
        invalidatesTags: (_r, _e, id) => changed(id),
      }),
      finishVisitAction: build.mutation<ApiVisit, number>({
        query: actionId => ({
          url: `visits/actions/${actionId}/done`,
          method: 'POST',
        }),
        transformResponse: one,
        invalidatesTags: r => changed(r?.id),
      }),
    }),
  });

export const {
  useVisitsInfiniteQuery,
  useVisitQuery,
  useSaveVisitMutation,
  useDeleteVisitMutation,
  useSubmitVisitMutation,
  useReviewVisitMutation,
  useFinishVisitActionMutation,
} = visitsApi;
