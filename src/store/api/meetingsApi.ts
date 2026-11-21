import { baseApi } from './baseApi';
import type { PageMeta } from './labApi';
import type { ApiPriority } from './tasksApi';
import type { Recurring } from '../../utils/recur';

// Shapes exactly as the API sends them.

export type MeetingStatus = 'draft' | 'scheduled' | 'inprogress' | 'completed' | 'cancelled';
export type Attendance = 'present' | 'absent' | 'late';
export type Rsvp = 'pending' | 'yes' | 'no';
export type ActionStatus = 'open' | 'progress' | 'done' | 'dropped';

// A client hospital the meeting can be tagged with; the meeting then shows on
// that hospital's Client Portal (MRM page) and they can respond there.
export type MeetingClient = { code: string; name: string; city: string };

// A note the client left on an agenda item from their portal.
export type AgendaResponse = { id: number; text: string; by: string; at: string | null };

// One line of an action item's follow-up history. `client` is set when the
// client hospital recorded it from their portal.
export type ActionUpdate = {
  id: number;
  status: ActionStatus;
  note: string | null;
  newDue: string | null;
  on: string | null;
  by: string;
  client: string | null;
};

export type ApiMeeting = {
  id: number;
  title: string;
  type: string;
  typeLabel: string;
  clientCode: string | null;
  clientName: string | null;
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
  // Set once the minutes are signed off (by the approve step, or by completing).
  minutesApproved: { by: string; at: string | null } | null;
  // Organiser/admin, meeting In progress, minutes not yet approved.
  mineToApprove: boolean;
  organiserId: number;
  organiserName: string;
  isOwner: boolean;
  mineToEdit: boolean;
  mineToComplete: boolean;
  attendees: {
    id: number;
    userId: number | null;
    name: string;
    role: string | null;
    attendance: Attendance;
    rsvp: Rsvp;
    rsvpNote: string | null;
  }[];
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
    decision: string | null;
    responses: AgendaResponse[];
  }[];
  actions: {
    id: number;
    text: string;
    assigneeId: number | null;
    assignee: string | null;
    due: string | null;
    priority: ApiPriority;
    status: ActionStatus;
    done: boolean;
    taskId: number | null;
    mineToFinish: boolean;
    updates: ActionUpdate[];
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
  client_code: string | null;
  client_name: string | null;
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
    decision: string | null;
  }[];
  action_items: {
    id: number | null;
    text: string;
    assignee: string | null;
    assignee_user_id: number | null;
    due_date: string | null;
    priority: ApiPriority;
    status: ActionStatus;
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
      // Client hospitals to tag a meeting with. Empty when the server has no
      // portal link configured.
      meetingClients: build.query<MeetingClient[], void>({
        query: () => 'meetings/clients',
        transformResponse: (r: { data: MeetingClient[] }) => r.data,
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
      // Sign off the minutes of a held meeting; completing it closes it afterwards.
      approveMinutes: build.mutation<ApiMeeting, number>({
        query: id => ({ url: `meetings/${id}/approve-minutes`, method: 'POST' }),
        transformResponse: one,
        invalidatesTags: (_r, _e, id) => ['Meetings', { type: 'Meeting', id }],
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
  useMeetingClientsQuery,
  useSaveMeetingMutation,
  useDeleteMeetingMutation,
  useCompleteMeetingMutation,
  useApproveMinutesMutation,
  useFinishMeetingActionMutation,
} = meetingsApi;
