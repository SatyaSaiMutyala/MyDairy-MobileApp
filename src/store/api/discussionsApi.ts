import { baseApi } from './baseApi';
import type { PageMeta } from './labApi';

// Shapes exactly as the API sends them.

export type Outcome = 'positive' | 'neutral' | 'concern' | 'escalation' | 'decision' | 'deferred';
export type Privacy = 'private' | 'team';

export type ApiDiscussion = {
  id: number;
  title: string;
  type: string;
  typeLabel: string;
  date: string | null;
  time: string | null;
  duration: string | null;
  summary: string | null;
  outcome: Outcome;
  outcomeLabel: string;
  privacy: Privacy;
  tags: string[];
  keyPoints: string[];
  ownerId: number;
  ownerName: string;
  isOwner: boolean;
  mineToEdit: boolean;
  with: { id: number; userId: number | null; name: string; org: string | null; isInternal: boolean }[];
  followUps: { id: number; text: string; due: string | null; done: boolean; taskId: number | null }[];
};

export type DiscussionFilters = {
  search?: string;
  type?: string;
  outcome?: Outcome;
  privacy?: Privacy;
  open?: 1;
  date_from?: string;
  date_to?: string;
};

export type DiscussionCounts = { total: number; attention: number; openFollowUps: number };
export type DiscussionPage = { data: ApiDiscussion[]; meta: PageMeta; counts: DiscussionCounts };

type Choice = { key: string; label: string };
export type DiscussionMeta = { types: Choice[]; outcomes: Choice[]; privacies: Choice[] };

// The body of the website's discussion form.
export type DiscussionBody = {
  title: string;
  type: string;
  date: string;
  time: string | null;
  duration: string | null;
  summary: string | null;
  outcome: Outcome;
  privacy: Privacy;
  tags: string[];
  key_points: string[];
  with: { user_id: number | null; name: string; org: string | null; is_internal: boolean }[];
  follow_ups: { id: number | null; text: string; due_date: string | null; done: boolean }[];
};

export const DISCUSSIONS_PER_PAGE = 20;

const one = (r: { discussion: ApiDiscussion }) => r.discussion;
// A dated follow-up becomes a task.
const changed = (id?: number) => [
  'Discussions' as const,
  'Tasks' as const,
  ...(id ? [{ type: 'Discussion' as const, id }] : []),
];

export const discussionsApi = baseApi
  .enhanceEndpoints({ addTagTypes: ['Discussions', 'Discussion', 'Tasks'] })
  .injectEndpoints({
    endpoints: build => ({
      discussions: build.infiniteQuery<DiscussionPage, DiscussionFilters, number>({
        infiniteQueryOptions: {
          initialPageParam: 1,
          getNextPageParam: last =>
            last.meta.page < last.meta.last_page ? last.meta.page + 1 : undefined,
        },
        query: ({ queryArg, pageParam }) => ({
          url: 'discussions',
          params: { ...queryArg, page: pageParam, per_page: DISCUSSIONS_PER_PAGE },
        }),
        providesTags: ['Discussions'],
      }),
      discussion: build.query<ApiDiscussion, number>({
        query: id => `discussions/${id}`,
        transformResponse: one,
        providesTags: (_r, _e, id) => [{ type: 'Discussion', id }],
      }),
      discussionMeta: build.query<DiscussionMeta, void>({
        query: () => 'discussions/meta',
        keepUnusedDataFor: 600,
      }),
      saveDiscussion: build.mutation<ApiDiscussion, { id?: number; body: DiscussionBody }>({
        query: ({ id, body }) => ({
          url: id ? `discussions/${id}` : 'discussions',
          method: 'POST',
          body,
        }),
        transformResponse: one,
        invalidatesTags: (_r, _e, { id }) => changed(id),
      }),
      // One line, nothing else: logged with today's date.
      quickDiscussion: build.mutation<
        ApiDiscussion,
        { title: string; type?: string; with?: string }
      >({
        query: body => ({ url: 'discussions/quick', method: 'POST', body }),
        transformResponse: one,
        invalidatesTags: () => changed(),
      }),
      deleteDiscussion: build.mutation<{ ok: true }, number>({
        query: id => ({ url: `discussions/${id}`, method: 'DELETE' }),
        invalidatesTags: ['Discussions'],
      }),
      duplicateDiscussion: build.mutation<ApiDiscussion, number>({
        query: id => ({ url: `discussions/${id}/duplicate`, method: 'POST' }),
        transformResponse: one,
        invalidatesTags: () => changed(),
      }),
      toggleFollowUp: build.mutation<ApiDiscussion, number>({
        query: followUpId => ({
          url: `discussions/follow-ups/${followUpId}/toggle`,
          method: 'POST',
        }),
        transformResponse: one,
        invalidatesTags: r => changed(r?.id),
      }),
    }),
  });

export const {
  useDiscussionsInfiniteQuery,
  useDiscussionQuery,
  useDiscussionMetaQuery,
  useSaveDiscussionMutation,
  useQuickDiscussionMutation,
  useDeleteDiscussionMutation,
  useDuplicateDiscussionMutation,
  useToggleFollowUpMutation,
} = discussionsApi;
