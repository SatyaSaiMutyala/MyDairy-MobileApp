import type { Priority } from '../data/mock';
import type { ApiVisit, VisitStatus } from '../store/api/visitsApi';
import { stamp } from '../tasks/model';

// A visit as the screens draw it, and the choices its form offers. The
// choices are the website's own lists.

export const visitTypes = [
  { id: 'branch', label: 'Branch Office Visit' },
  { id: 'supplier', label: 'Supplier / Vendor Visit' },
  { id: 'client', label: 'Client Site Visit' },
  { id: 'franchise', label: 'Franchise Partner Visit' },
  { id: 'collection', label: 'Collection Centre Visit' },
  { id: 'regulatory', label: 'Regulatory / Govt Visit' },
  { id: 'other', label: 'Other Site Visit' },
];

export const assessments = [
  { id: 'excellent', label: 'Excellent' },
  { id: 'good', label: 'Good' },
  { id: 'satisfactory', label: 'Satisfactory' },
  { id: 'improvement', label: 'Needs Improvement' },
  { id: 'poor', label: 'Unsatisfactory' },
];

export const observationCategories = [
  { id: 'positive', label: 'Positive Observation' },
  { id: 'concern', label: 'Concern' },
  { id: 'nc_minor', label: 'Minor NC' },
  { id: 'nc_major', label: 'Major NC' },
  { id: 'recommendation', label: 'Recommendation' },
  { id: 'improvement', label: 'Improvement Area' },
];

export const followUps = [
  { id: 'no', label: 'No — visit complete' },
  { id: 'yes', label: 'Yes — follow-up needed' },
  { id: 'escalate', label: 'Escalate to CMD' },
];

export const ratingAreas = [
  { id: 'infrastructure', label: 'Infrastructure & Facilities' },
  { id: 'quality', label: 'Quality Systems' },
  { id: 'safety', label: 'Safety & Housekeeping' },
  { id: 'compliance', label: 'Regulatory Compliance' },
  { id: 'staff', label: 'Staff Competency' },
  { id: 'documentation', label: 'Documentation & Records' },
];

// Rows the person can add and remove carry a local key; rows that already
// exist on the server also carry their own id.
export type VisitMember = {
  key: string;
  userId?: number;
  name: string;
  lead: boolean;
};
export type VisitObservation = {
  key: string;
  category: string;
  text: string;
  evidence?: string;
};
export type VisitAction = {
  key: string;
  serverId?: number;
  text: string;
  assigneeId?: number;
  assignee?: string;
  due: string; // YYYY-MM-DD, or '' for no date
  priority: Priority;
  done: boolean;
  taskId?: number;
};
export type VisitPhoto = { id: string; uri?: string; serverId?: number };

export type Visit = {
  id: number;
  title: string;
  type: string;
  status: VisitStatus;
  date: string;
  timeIn?: string;
  timeOut?: string;
  org?: string;
  branch?: string;
  address?: string;
  city?: string;
  state?: string;
  gps?: string;
  hostName?: string;
  hostTitle?: string;
  hostPhone?: string;
  hostEmail?: string;
  external?: string;
  purpose?: string;
  scope?: string;
  refs?: string;
  tags: string[];
  ratings: Record<string, number>;
  assessment?: string;
  summary?: string;
  followUp: string;
  nextVisit?: string;
  remarks?: string;
  owner: string;
  submittedOn?: string;
  reviewedBy?: string;
  canEdit: boolean;
  canDelete: boolean;
  canReview: boolean;
  team: VisitMember[];
  observations: VisitObservation[];
  actions: VisitAction[];
  photos: VisitPhoto[];
};

const priorityNames = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
} as const;
const text = (v: string | null) => v ?? undefined;

export const toVisit = (v: ApiVisit): Visit => ({
  id: v.id,
  title: v.title,
  type: v.type,
  status: v.status,
  date: v.date,
  timeIn: text(v.timeIn),
  timeOut: text(v.timeOut),
  org: text(v.org),
  branch: text(v.branch),
  address: text(v.address),
  city: text(v.city),
  state: text(v.state),
  gps: text(v.gps),
  hostName: text(v.hostName),
  hostTitle: text(v.hostTitle),
  hostPhone: text(v.hostPhone),
  hostEmail: text(v.hostEmail),
  external: text(v.external),
  purpose: text(v.purpose),
  scope: text(v.scope),
  refs: text(v.refs),
  tags: v.tags ?? [],
  ratings: v.ratings ?? {},
  assessment: text(v.assessment),
  summary: text(v.summary),
  followUp: v.followUp,
  nextVisit: text(v.nextVisit),
  remarks: text(v.remarks),
  owner: v.ownerName,
  submittedOn: stamp(v.submittedAt) || undefined,
  reviewedBy: text(v.reviewedBy),
  canEdit: v.mineToEdit,
  canDelete: v.mineToDelete,
  canReview: v.mineToReview,
  team: v.team.map(t => ({
    key: `t${t.id}`,
    userId: t.userId ?? undefined,
    name: t.name,
    lead: t.lead,
  })),
  observations: v.observations.map(o => ({
    key: `o${o.id}`,
    category: o.category,
    text: o.text,
    evidence: text(o.evidence),
  })),
  actions: v.actions.map(a => ({
    key: `a${a.id}`,
    serverId: a.id,
    text: a.text,
    assigneeId: a.assigneeId ?? undefined,
    assignee: text(a.assignee),
    due: a.due ?? '',
    priority: priorityNames[a.priority] ?? 'Medium',
    done: a.done,
    taskId: a.taskId ?? undefined,
  })),
  photos: v.photos.map(p => ({
    id: `saved-${p.id}`,
    uri: p.url ?? undefined,
    serverId: p.id,
  })),
});

export type VisitDraft = Omit<
  Visit,
  | 'id'
  | 'owner'
  | 'submittedOn'
  | 'reviewedBy'
  | 'canEdit'
  | 'canDelete'
  | 'canReview'
  | 'status'
> & {
  status: 'draft' | 'submitted';
  removedPhotoIds: number[];
};

// The same fields the website's visit form posts: plain fields as text,
// lists as JSON text, photographs as files.
export function visitForm(d: VisitDraft): FormData {
  const form = new FormData();
  const put = (key: string, value?: string) =>
    form.append(key, value?.trim() ?? '');

  put('title', d.title);
  put('type', d.type);
  put('status', d.status);
  put('date', d.date);
  put('time_in', d.timeIn);
  put('time_out', d.timeOut);
  put('visited_org', d.org);
  put('branch', d.branch);
  put('address', d.address);
  put('city', d.city);
  put('state', d.state);
  put('gps_link', d.gps);
  put('host_name', d.hostName);
  put('host_title', d.hostTitle);
  put('host_phone', d.hostPhone);
  put('host_email', d.hostEmail);
  put('external_participants', d.external);
  put('purpose', d.purpose);
  put('scope', d.scope);
  put('refs', d.refs);
  put('overall_assessment', d.assessment);
  put('executive_summary', d.summary);
  put('follow_up_required', d.followUp);
  put('next_visit_date', d.nextVisit);
  put('remarks', d.remarks);

  form.append('tags', JSON.stringify(d.tags));
  form.append('area_ratings', JSON.stringify(d.ratings));
  form.append(
    'team',
    JSON.stringify(
      d.team.map(m => ({
        user_id: m.userId ?? null,
        name: m.name,
        is_lead: m.lead,
      })),
    ),
  );
  form.append(
    'observations',
    JSON.stringify(
      d.observations
        .filter(o => o.text.trim())
        .map(o => ({
          category: o.category,
          description: o.text.trim(),
          evidence: o.evidence?.trim() || null,
        })),
    ),
  );
  form.append(
    'action_items',
    JSON.stringify(
      d.actions
        .filter(a => a.text.trim())
        .map(a => ({
          id: a.serverId ?? null,
          text: a.text.trim(),
          assignee: a.assignee ?? '',
          assignee_user_id: a.assigneeId ?? null,
          due_date: a.due || null,
          priority: a.priority.toLowerCase(),
          status: a.done ? 'done' : 'open',
        })),
    ),
  );
  if (d.removedPhotoIds.length) {
    form.append('removed_photo_ids', JSON.stringify(d.removedPhotoIds));
  }
  d.photos
    .filter(p => !p.serverId && p.uri)
    .forEach((p, i) =>
      form.append('photos[]', {
        uri: p.uri,
        name: `visit-photo-${i + 1}.jpg`,
        type: 'image/jpeg',
      } as unknown as Blob),
    );
  return form;
}
