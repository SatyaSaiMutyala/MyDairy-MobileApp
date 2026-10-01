import { baseApi } from './baseApi';
import type { PageMeta } from './labApi';

// Shapes exactly as the API sends them.

export type DiaryType =
  | 'meeting'
  | 'task'
  | 'appointment'
  | 'focus'
  | 'reminder'
  | 'event';
export type InviteResponse = 'pending' | 'accepted' | 'tentative' | 'declined';

export type ApiDiaryEntry = {
  id: number;
  type: DiaryType;
  title: string;
  date: string;
  allDay: boolean;
  startTime: string | null;
  endTime: string | null;
  location: string | null;
  notes: string | null;
  // The module the entry came from; null = written in the diary itself.
  origin: string | null;
  cadence: 'weekly' | 'monthly' | null;
  ownerId: number;
  ownerName: string;
  createdBy: string | null;
  isOwner: boolean;
  mineToEdit: boolean;
  // My own invitation to this entry, if I was tagged on it.
  myInvite: { id: number; status: InviteResponse } | null;
  invitees: { id: number; name: string; status: InviteResponse }[];
  // Only on a single entry: a meeting's agenda.
  agenda?: { title: string; owner: string; duration: number; notes: string }[];
};

export type DiaryRange = {
  date_from: string;
  date_to: string;
  type?: DiaryType;
  search?: string;
};

export type DiaryPage = {
  data: ApiDiaryEntry[];
  meta: PageMeta;
  // Entries per day over the whole range, for the calendar dots.
  days: Record<string, number>;
};

export type ApiInvite = {
  inviteId: number;
  entryId: number;
  status: InviteResponse;
  title: string;
  date: string;
  allDay: boolean;
  startTime: string | null;
  endTime: string | null;
  location: string | null;
  invitedBy: string;
};

export type DiaryBody = {
  type: DiaryType;
  title: string;
  date: string;
  all_day: boolean;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  notes: string | null;
  invitees: number[];
};

const one = (r: { entry: ApiDiaryEntry }) => r.entry;
const nextPage = {
  initialPageParam: 1,
  getNextPageParam: (last: { meta: PageMeta }) =>
    last.meta.page < last.meta.last_page ? last.meta.page + 1 : undefined,
};
// Any change can move an entry between days and alter the invitations.
const changed = (id?: number) => [
  'Diary' as const,
  'DiaryInvites' as const,
  ...(id ? [{ type: 'DiaryEntry' as const, id }] : []),
];

export const diaryApi = baseApi
  .enhanceEndpoints({ addTagTypes: ['Diary', 'DiaryInvites', 'DiaryEntry'] })
  .injectEndpoints({
    endpoints: build => ({
      diary: build.infiniteQuery<DiaryPage, DiaryRange, number>({
        infiniteQueryOptions: nextPage,
        query: ({ queryArg, pageParam }) => ({
          url: 'diary',
          params: { ...queryArg, page: pageParam, per_page: 50 },
        }),
        providesTags: ['Diary'],
      }),
      // The first meeting from a day onwards, for the Home screen.
      nextMeeting: build.query<
        ApiDiaryEntry | null,
        { date_from: string; date_to: string }
      >({
        query: params => ({
          url: 'diary',
          params: { ...params, type: 'meeting', per_page: 1 },
        }),
        transformResponse: (r: DiaryPage) => r.data[0] ?? null,
        providesTags: ['Diary'],
      }),
      diaryInvites: build.infiniteQuery<
        { data: ApiInvite[]; meta: PageMeta },
        { status?: InviteResponse },
        number
      >({
        infiniteQueryOptions: nextPage,
        query: ({ queryArg, pageParam }) => ({
          url: 'diary/invites',
          params: { ...queryArg, page: pageParam, per_page: 20 },
        }),
        providesTags: ['DiaryInvites'],
      }),
      diaryEntry: build.query<ApiDiaryEntry, number>({
        query: id => `diary/${id}`,
        transformResponse: one,
        providesTags: (_r, _e, id) => [{ type: 'DiaryEntry', id }],
      }),
      // Create when there is no id, otherwise replace the entry's fields.
      saveDiaryEntry: build.mutation<
        ApiDiaryEntry,
        { id?: number; body: DiaryBody }
      >({
        query: ({ id, body }) => ({
          url: id ? `diary/${id}` : 'diary',
          method: id ? 'PATCH' : 'POST',
          body,
        }),
        transformResponse: one,
        invalidatesTags: (_r, _e, { id }) => changed(id),
      }),
      deleteDiaryEntry: build.mutation<{ ok: true }, number>({
        query: id => ({ url: `diary/${id}`, method: 'DELETE' }),
        invalidatesTags: ['Diary', 'DiaryInvites'],
      }),
      respondInvite: build.mutation<
        ApiDiaryEntry,
        { inviteId: number; response: Exclude<InviteResponse, 'pending'> }
      >({
        query: ({ inviteId, response }) => ({
          url: `diary/invites/${inviteId}/respond`,
          method: 'POST',
          body: { response },
        }),
        transformResponse: one,
        invalidatesTags: r => changed(r?.id),
      }),
    }),
  });

export const {
  useDiaryInfiniteQuery,
  useNextMeetingQuery,
  useDiaryInvitesInfiniteQuery,
  useDiaryEntryQuery,
  useSaveDiaryEntryMutation,
  useDeleteDiaryEntryMutation,
  useRespondInviteMutation,
} = diaryApi;
