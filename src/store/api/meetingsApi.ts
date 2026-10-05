import { baseApi } from './baseApi';
import type { PageMeta } from './labApi';
import type { ApiPriority } from './tasksApi';
import type { Recurring } from '../../utils/recur';

// Shapes exactly as the API sends them.

export type MeetingStatus = 'draft' | 'scheduled' | 'inprogress' | 'completed' | 'cancelled';
export type Attendance = 'present' | 'absent' | 'late';

export type ApiMeeting = {
  id: number;
  title: string;
  type: string;
  typeLabel: string;
  status: MeetingStatus;
  statusLabel: string;
  date: string | null;
  time: string | null;
  endTime: string | null;
  duration: number;
  location: string | null;
  locationType: string;
  context: string | null;
  quorum: string | null;
  recordedBy: string | null;
  remarks: string | null;
  decisions: string[];
  parkingLot: string[];
  nextMeeting: { date: string | null; time: string | null; agenda: string | null };
  recurring: Recurring | null;
  seriesId: number | null;
  completedAt: string | null;
  organiserId: number;
  organiserName: string;
  isOwner: boolean;
  mineToEdit: boolean;
  mineToComplete: boolean;
  attendees: { id: number; userId: number | null; name: string; role: string | null; attendance: Attendance }[];
  agenda: {
    id: number;
    title: string;
    type: string;
    typeLabel: string;
    owner: string | null;
    ownerUserId: number | null;
    duration: number;
    notes: string | null;
    minutesNotes: string | null;
  }[];
  actions: {
    id: number;
    text: string;
    assigneeId: number | null;
    assignee: string | null;
    due: string | null;
    priority: ApiPriority;
    done: boolean;
    taskId: number | null;
    mineToFinish: boolean;
  }[];
};

export type MeetingFilters = {
  search?: string;
  type?: string;
  status?: MeetingStatus;
  when?: 'upcoming' | 'past';
  date_from?: string;
  date_to?: string;
  sort?: 'recent' | 'oldest';
};

export type MeetingCounts = { upcoming: number; completed: number; openActions: number };
export type MeetingPage = { data: ApiMeeting[]; meta: PageMeta; counts: MeetingCounts };

type Choice = { key: string; label: string };
export type MeetingMeta = {
  types: Choice[];
  statuses: Choice[];
  locationTypes: Choice[];
  agendaTypes: Choice[];
  attendance: Choice[];
};

// The body of the website's meeting form.
export type MeetingBody = {
  title: string;
  type: string;
  status: MeetingStatus;
  date: string;
  time: string | null;
  duration: number;
  location: string | null;
  location_type: string;
  context: string | null;
  quorum: string | null;
  recorded_by: string | null;
  remarks: string | null;
  decisions: string[];
  parking_lot: string[];
  next_meeting: { date: string | null; time: string | null; agenda: string | null };
  recurring: Recurring | null;
  attendees: { user_id: number | null; name: string; role: string | null; attendance: Attendance }[];
  agenda: {
    title: string;
    type: string;
    owner: string | null;
    owner_user_id: number | null;
    duration: number;
    notes: string | null;
    minutes_notes: string | null;
  }[];
  action_items: {
    id: number | null;
    text: string;
    assignee: string | null;
    assignee_user_id: number | null;
    due_date: string | null;
    priority: ApiPriority;
    status: 'open' | 'done';
  }[];
};

export const MEETINGS_PER_PAGE = 20;

const one = (r: { meeting: ApiMeeting }) => r.meeting;
// Completing a meeting creates tasks and books the next one; attendees get diary invites.
const changed = (id?: number) => [
  'Meetings' as const,
  'Tasks' as const,
  'Diary' as const,
  ...(id ? [{ type: 'Meeting' as const, id }] : []),
];

export const meetingsApi = baseApi
  .enhanceEndpoints({ addTagTypes: ['Meetings', 'Meeting', 'Tasks', 'Diary'] })
  .injectEndpoints({
    endpoints: build => ({
      meetings: build.infiniteQuery<MeetingPage, MeetingFilters, number>({
        infiniteQueryOptions: {
          initialPageParam: 1,
          getNextPageParam: last =>
            last.meta.page < last.meta.last_page ? last.meta.page + 1 : undefined,
        },
        query: ({ queryArg, pageParam }) => ({
          url: 'meetings',
          params: { ...queryArg, page: pageParam, per_page: MEETINGS_PER_PAGE },
        }),
        providesTags: ['Meetings'],
      }),
      meeting: build.query<ApiMeeting, number>({
        query: id => `meetings/${id}`,
        transformResponse: one,
        providesTags: (_r, _e, id) => [{ type: 'Meeting', id }],
      }),
      meetingMeta: build.query<MeetingMeta, void>({
        query: () => 'meetings/meta',
        keepUnusedDataFor: 600,
      }),
      saveMeeting: build.mutation<ApiMeeting, { id?: number; body: MeetingBody }>({
        query: ({ id, body }) => ({
          url: id ? `meetings/${id}` : 'meetings',
          method: 'POST',
          body,
        }),
        transformResponse: one,
        invalidatesTags: (_r, _e, { id }) => changed(id),
      }),
      deleteMeeting: build.mutation<{ ok: true }, number>({
        query: id => ({ url: `meetings/${id}`, method: 'DELETE' }),
        invalidatesTags: ['Meetings', 'Diary'],
      }),
      completeMeeting: build.mutation<ApiMeeting, number>({
        query: id => ({ url: `meetings/${id}/complete`, method: 'POST' }),
        transformResponse: one,
        invalidatesTags: (_r, _e, id) => changed(id),
      }),
      finishMeetingAction: build.mutation<ApiMeeting, number>({
        query: actionId => ({ url: `meetings/actions/${actionId}/done`, method: 'POST' }),
        transformResponse: one,
        invalidatesTags: r => changed(r?.id),
      }),
    }),
  });

export const {
  useMeetingsInfiniteQuery,
  useMeetingQuery,
  useMeetingMetaQuery,
  useSaveMeetingMutation,
  useDeleteMeetingMutation,
  useCompleteMeetingMutation,
  useFinishMeetingActionMutation,
} = meetingsApi;
