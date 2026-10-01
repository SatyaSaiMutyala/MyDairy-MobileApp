import { baseApi } from './baseApi';
import type { PageMeta } from './labApi';
import type { Recurring } from '../../utils/recur';

// Shapes exactly as the API sends them.

export type ApiPriority = 'critical' | 'high' | 'medium' | 'low';
export type TaskBox = 'mine' | 'inbox' | 'out';
export type TaskStatus =
  | 'today'
  | 'overdue'
  | 'returned'
  | 'upcoming'
  | 'done'
  | 'all';

export type ApiAttachment = {
  id: number;
  name: string;
  ext: string | null;
  bytes: number;
  mime: string | null;
  url: string | null;
};

export type ApiTask = {
  id: number;
  title: string;
  description: string;
  priority: ApiPriority;
  category: string;
  categoryName: string;
  location: string | null;
  locationName: string | null;
  tags: string[];
  hard: boolean;
  dueDate: string | null;
  dueTime: string | null;
  // The date to show: the stored one, or a recurring task's first occurrence.
  due: string | null;
  recurring: Recurring | null;
  createdOn: string | null;
  status: 'pending' | 'completed' | 'returned' | 'escalated';
  done: boolean;
  doneForNow: boolean;
  overdue: boolean;
  lastDone: { date: string | null; at: string | null } | null;
  box: TaskBox;
  mineToEdit: boolean;
  mineToDelete: boolean;
  ownerId: number;
  ownerName: string;
  assigneeId: number;
  assigneeName: string;
  attachments: ApiAttachment[];
  escalation: {
    fromId: number;
    fromName: string;
    toId: number;
    toName: string;
    reason: string;
    reasonLabel: string;
    note: string | null;
    expectBy: string | null;
    at: string | null;
  } | null;
  returned: {
    byId: number;
    byName: string;
    reason: string;
    reasonLabel: string;
    askNote: string | null;
    askedAt: string | null;
    action: string;
    actionLabel: string;
    note: string;
    at: string | null;
  } | null;
};

// Each filter is its own query parameter. Empty ones are left out.
export type TaskFilters = {
  box?: TaskBox;
  status?: TaskStatus;
  search?: string;
  priority?: ApiPriority;
  department?: string;
  location?: string;
  owner?: number;
  hard?: 1;
  due?: 'today' | 'week' | 'month';
  due_date?: string;
};

export type TaskCounts = { mine: number; inbox: number; out: number } & Partial<
  Record<TaskStatus, number>
>;

export type TaskPage = { data: ApiTask[]; meta: PageMeta; counts: TaskCounts };

type Choice = { key: string; label: string };

export type TaskMeta = {
  categories: Choice[];
  locations: Choice[];
  defaultCategory: string;
  reasons: Choice[];
  actions: Choice[];
};

export type Person = {
  id: number;
  name: string;
  email: string;
  designation: string | null;
  dept: string | null;
  deptName: string | null;
};

export const TASKS_PER_PAGE = 20;

const one = (r: { task: ApiTask }) => r.task;
// Any change can move a task between lists and alter the counts.
const changed = (id?: number) => [
  { type: 'Tasks' as const, id: 'LIST' },
  ...(id ? [{ type: 'Task' as const, id }] : []),
];

export const tasksApi = baseApi
  .enhanceEndpoints({ addTagTypes: ['Tasks', 'Task'] })
  .injectEndpoints({
    endpoints: build => ({
      tasks: build.infiniteQuery<TaskPage, TaskFilters, number>({
        infiniteQueryOptions: {
          initialPageParam: 1,
          getNextPageParam: last =>
            last.meta.page < last.meta.last_page
              ? last.meta.page + 1
              : undefined,
        },
        query: ({ queryArg, pageParam }) => ({
          url: 'tasks',
          params: { ...queryArg, page: pageParam, per_page: TASKS_PER_PAGE },
        }),
        providesTags: [{ type: 'Tasks', id: 'LIST' }],
      }),
      task: build.query<ApiTask, number>({
        query: id => `tasks/${id}`,
        transformResponse: one,
        providesTags: (_r, _e, id) => [{ type: 'Task', id }],
      }),
      taskMeta: build.query<TaskMeta, void>({
        query: () => 'tasks/meta',
        keepUnusedDataFor: 600,
      }),
      people: build.query<
        Person[],
        { search?: string; exclude_me?: 1; per_page?: number }
      >({
        query: params => ({
          url: 'users',
          params: { per_page: 100, ...params },
        }),
        transformResponse: (r: { data: Person[] }) => r.data,
        keepUnusedDataFor: 600,
      }),
      // The same list, a page at a time, for a searchable picker.
      peoplePaged: build.infiniteQuery<
        { data: Person[]; meta: PageMeta },
        { search?: string; exclude_me?: 1 },
        number
      >({
        infiniteQueryOptions: {
          initialPageParam: 1,
          getNextPageParam: last =>
            last.meta.page < last.meta.last_page
              ? last.meta.page + 1
              : undefined,
        },
        query: ({ queryArg, pageParam }) => ({
          url: 'users',
          params: { ...queryArg, page: pageParam, per_page: 20 },
        }),
        keepUnusedDataFor: 120,
      }),
      // Create when there is no id, otherwise replace the task's fields.
      saveTask: build.mutation<ApiTask, { id?: number; form: FormData }>({
        query: ({ id, form }) => ({
          url: id ? `tasks/${id}` : 'tasks',
          method: 'POST',
          body: form,
        }),
        transformResponse: one,
        invalidatesTags: (_r, _e, { id }) => changed(id),
      }),
      deleteTask: build.mutation<{ ok: true }, number>({
        query: id => ({ url: `tasks/${id}`, method: 'DELETE' }),
        invalidatesTags: [{ type: 'Tasks', id: 'LIST' }],
      }),
      toggleTask: build.mutation<ApiTask, number>({
        query: id => ({ url: `tasks/${id}/toggle`, method: 'POST' }),
        transformResponse: one,
        invalidatesTags: (_r, _e, id) => changed(id),
      }),
      escalateTask: build.mutation<
        ApiTask,
        {
          id: number;
          to_user_id: number;
          reason: string;
          note?: string;
          expected_resolution_by?: string;
        }
      >({
        query: ({ id, ...body }) => ({
          url: `tasks/${id}/escalate`,
          method: 'POST',
          body,
        }),
        transformResponse: one,
        invalidatesTags: (_r, _e, { id }) => changed(id),
      }),
      resolveTask: build.mutation<
        ApiTask,
        { id: number; resolution_action: string; resolution_note: string }
      >({
        query: ({ id, ...body }) => ({
          url: `tasks/${id}/resolve`,
          method: 'POST',
          body,
        }),
        transformResponse: one,
        invalidatesTags: (_r, _e, { id }) => changed(id),
      }),
    }),
  });

export const {
  useTasksInfiniteQuery,
  useTaskQuery,
  useTaskMetaQuery,
  usePeopleQuery,
  usePeoplePagedInfiniteQuery,
  useSaveTaskMutation,
  useDeleteTaskMutation,
  useToggleTaskMutation,
  useEscalateTaskMutation,
  useResolveTaskMutation,
} = tasksApi;
