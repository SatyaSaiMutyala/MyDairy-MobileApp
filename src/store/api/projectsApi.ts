import { baseApi } from './baseApi';
import type { PageMeta } from './labApi';
import type { ApiPriority } from './tasksApi';

// Shapes exactly as the API sends them.

export type ProjectStatus = 'planning' | 'active' | 'at_risk' | 'overdue' | 'on_hold' | 'completed';
export type MilestoneStatus =
  | 'not_started'
  | 'in_progress'
  | 'at_risk'
  | 'blocked'
  | 'completed'
  | 'deferred';

export type ApiMilestone = {
  id: number;
  title: string;
  description: string | null;
  deadline: string | null;
  revisedDeadline: string | null;
  revisionReason: string | null;
  revisionReasonLabel: string | null;
  revisionNotes: string | null;
  pctComplete: number;
  status: MilestoneStatus;
  statusLabel: string;
  overdue: boolean;
  ownerUserId: number | null;
  ownerName: string | null;
  impact: ApiPriority;
  impactDescription: string | null;
  dependencies: string | null;
  completionCriteria: string | null;
  taskId: number | null;
  mineToEdit: boolean;
};

export type ApiProject = {
  id: number;
  title: string;
  description: string | null;
  category: string;
  categoryLabel: string;
  priority: ApiPriority;
  status: ProjectStatus;
  statusLabel: string;
  startDate: string | null;
  targetEndDate: string | null;
  actualEndDate: string | null;
  kpis: string[];
  tags: string[];
  ownerId: number;
  ownerName: string;
  isOwner: boolean;
  mineToEdit: boolean;
  team: { id: number; userId: number | null; name: string }[];
  progress: number;
  milestoneCounts: { total: number; done: number; atRisk: number; overdue: number };
  milestones: ApiMilestone[];
};

export type ProjectFilters = {
  search?: string;
  category?: string;
  status?: ProjectStatus;
  priority?: ApiPriority;
};

export type ProjectCounts = { total: number; active: number; attention: number; completed: number };
export type ProjectPage = { data: ApiProject[]; meta: PageMeta; counts: ProjectCounts };

type Choice = { key: string; label: string };
export type ProjectMeta = {
  categories: Choice[];
  statuses: Choice[];
  milestoneStatuses: Choice[];
  reasons: Choice[];
};

export type ProjectBody = {
  title: string;
  description: string | null;
  category: string;
  priority: ApiPriority;
  start_date: string;
  target_end_date: string;
  owner_user_id: number | null;
  kpis: string[];
  tags: string[];
  team: { user_id: number | null; name: string }[];
};

export type MilestoneBody = {
  title: string;
  description: string | null;
  deadline: string;
  revised_deadline: string | null;
  revision_reason: string | null;
  revision_notes: string | null;
  pct_complete: number;
  status: MilestoneStatus;
  owner_user_id: number | null;
  owner_name: string | null;
  impact: ApiPriority;
  impact_description: string | null;
  dependencies: string | null;
  completion_criteria: string | null;
};

export const PROJECTS_PER_PAGE = 20;

const one = (r: { project: ApiProject }) => r.project;
// A milestone with an owner becomes a task for them.
const changed = (id?: number) => [
  'Projects' as const,
  'Tasks' as const,
  ...(id ? [{ type: 'Project' as const, id }] : []),
];

export const projectsApi = baseApi
  .enhanceEndpoints({ addTagTypes: ['Projects', 'Project', 'Tasks'] })
  .injectEndpoints({
    endpoints: build => ({
      projects: build.infiniteQuery<ProjectPage, ProjectFilters, number>({
        infiniteQueryOptions: {
          initialPageParam: 1,
          getNextPageParam: last =>
            last.meta.page < last.meta.last_page ? last.meta.page + 1 : undefined,
        },
        query: ({ queryArg, pageParam }) => ({
          url: 'projects',
          params: { ...queryArg, page: pageParam, per_page: PROJECTS_PER_PAGE },
        }),
        providesTags: ['Projects'],
      }),
      project: build.query<ApiProject, number>({
        query: id => `projects/${id}`,
        transformResponse: one,
        providesTags: (_r, _e, id) => [{ type: 'Project', id }],
      }),
      projectMeta: build.query<ProjectMeta, void>({
        query: () => 'projects/meta',
        keepUnusedDataFor: 600,
      }),
      saveProject: build.mutation<ApiProject, { id?: number; body: ProjectBody }>({
        query: ({ id, body }) => ({
          url: id ? `projects/${id}` : 'projects',
          method: 'POST',
          body,
        }),
        transformResponse: one,
        invalidatesTags: (_r, _e, { id }) => changed(id),
      }),
      deleteProject: build.mutation<{ ok: true }, number>({
        query: id => ({ url: `projects/${id}`, method: 'DELETE' }),
        invalidatesTags: ['Projects'],
      }),
      saveMilestone: build.mutation<
        ApiProject,
        { projectId: number; id?: number; body: MilestoneBody }
      >({
        query: ({ projectId, id, body }) => ({
          url: id ? `projects/${projectId}/milestones/${id}` : `projects/${projectId}/milestones`,
          method: 'POST',
          body,
        }),
        transformResponse: one,
        invalidatesTags: (_r, _e, { projectId }) => changed(projectId),
      }),
      deleteMilestone: build.mutation<ApiProject, { projectId: number; id: number }>({
        query: ({ projectId, id }) => ({
          url: `projects/${projectId}/milestones/${id}`,
          method: 'DELETE',
        }),
        transformResponse: one,
        invalidatesTags: (_r, _e, { projectId }) => changed(projectId),
      }),
    }),
  });

export const {
  useProjectsInfiniteQuery,
  useProjectQuery,
  useProjectMetaQuery,
  useSaveProjectMutation,
  useDeleteProjectMutation,
  useSaveMilestoneMutation,
  useDeleteMilestoneMutation,
} = projectsApi;
