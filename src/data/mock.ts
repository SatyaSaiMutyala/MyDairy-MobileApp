// Dummy data for the UI round. Replaced by Laravel APIs once the UI is approved.

export const DEMO_PASSWORD = 'Trust@123';

export { currentUser } from './user';

export const today = {
  long: 'Tuesday, 29 September 2026',
  short: 'Tue, 29 Sep 2026',
  greeting: 'Good morning,',
};

export type Priority = 'Critical' | 'High' | 'Medium' | 'Low';

export type Task = {
  id: string;
  // Who the task belongs to.
  owner: string;
  title: string;
  priority: Priority;
  area: string;
  due: string;
  bucket: 'today' | 'upcoming' | 'done';
  overdue?: boolean;
  // Short label of how it repeats, e.g. 'Weekly'.
  repeat?: string;
  recurring?: import('../utils/recur').Recurring;
  done?: boolean;
  description?: string;
  hard?: boolean;
  tags?: string[];
  location?: string;
  attachments?: import('../utils/files').PickedFile[];
  // Kept so the task can be edited later.
  dueDate?: string;
  dueTime?: string;
  // Set while the task is with a colleague (shown in Escalated out).
  escalatedTo?: string;
  // Set when a colleague escalated this task to me (shown in Inbox).
  from?: string;
  escalation?: Escalation;
  // Set when the colleague answered and the task came back to me.
  returned?: Resolution;
  // Recurring tasks: when the last occurrence was ticked.
  lastDone?: string;
};

export type Escalation = {
  reason: string;
  note?: string;
  expectedBy?: string;
  on: string;
};

export type Resolution = {
  by: string;
  action: string;
  note: string;
  on: string;
};

const ME = 'Ravi Kumar';

export const tasks: Task[] = [
  { id: 't1', owner: ME, title: 'Upload calibration certificates to QMS', priority: 'Critical', area: 'Quality', location: 'HYD', due: '09:00', dueDate: '2026-09-29', dueTime: '09:00', bucket: 'today', overdue: true, hard: true },
  { id: 't2', owner: ME, title: 'Review EQAS results — Haematology', priority: 'High', area: 'Quality', location: 'HYD', due: '14:00', dueDate: '2026-09-29', dueTime: '14:00', bucket: 'today' },
  {
    id: 't3', owner: ME, title: 'Weekly reagent stock count', priority: 'Medium', area: 'Material Management', location: 'HYD', due: '17:00', dueDate: '2026-09-29', bucket: 'today',
    repeat: 'Weekly', recurring: { freq: 'weekly', days: [1], time: '17:00', start: '2026-09-01' },
  },
  { id: 't4', owner: ME, title: 'Submit NABL internal audit closure note', priority: 'High', area: 'Quality', due: '08:30', dueDate: '2026-09-29', dueTime: '08:30', bucket: 'today', overdue: true },
  {
    id: 't5', owner: ME, title: 'Verify critical value call-back register', priority: 'Medium', area: 'Clinical Operations', location: 'HYD', due: '18:00', dueDate: '2026-09-29', bucket: 'today',
    repeat: 'Daily', recurring: { freq: 'daily', time: '18:00', start: '2026-09-01' },
  },
  { id: 't6', owner: ME, title: 'Share TAT outlier list with front office', priority: 'Low', area: 'Customer Service', due: '19:00', dueDate: '2026-09-29', dueTime: '19:00', bucket: 'today' },
  { id: 't7', owner: ME, title: 'Plan analyser preventive maintenance slot', priority: 'Medium', area: 'Biomedical Operations', location: 'ATP', due: 'Thu, 1 Oct', dueDate: '2026-10-01', bucket: 'upcoming' },
  { id: 't8', owner: ME, title: 'Competency assessment — two new technicians', priority: 'High', area: 'Human Resources', location: 'HYD', due: 'Fri, 2 Oct', dueDate: '2026-10-02', bucket: 'upcoming' },
  {
    id: 't9', owner: ME, title: 'Renew biomedical waste pickup agreement', priority: 'Low', area: 'Facilities', due: 'Mon, 5 Oct', dueDate: '2026-10-05', bucket: 'upcoming',
    repeat: 'Annual', recurring: { freq: 'annual', month: 10, dayOfMonth: '5', start: '2025-10-05' },
  },
  {
    id: 't12', owner: 'Suresh Naidu', title: 'Approve purchase of replacement freezer door seal', priority: 'High', area: 'Biomedical Operations', location: 'HYD', due: '16:00', dueDate: '2026-09-29', dueTime: '16:00', bucket: 'today',
    from: 'Suresh Naidu',
    escalation: { reason: 'Awaiting approval', note: 'Vendor quote is ₹4,800. Need your approval to raise the PO today.', expectedBy: 'Tue, 29 Sep', on: 'Today, 08:10' },
  },
  {
    id: 't13', owner: 'Anitha Rao', title: 'Confirm backup rider for Guntur pickups', priority: 'Medium', area: 'Logistics', location: 'GNT', due: 'Wed, 30 Sep', dueDate: '2026-09-30', bucket: 'upcoming',
    from: 'Anitha Rao',
    escalation: { reason: 'Decision required', note: 'Two vendors are available. Which one should we use this week?', on: 'Today, 08:35' },
  },
  {
    id: 't14', owner: ME, title: 'Get QC material lot change approved', priority: 'High', area: 'Quality', due: '15:00', dueDate: '2026-09-29', dueTime: '15:00', bucket: 'today',
    escalatedTo: 'Anil Reddy',
    escalation: { reason: 'Awaiting approval', note: 'New lot arrives Thursday. Parallel run plan attached in QMS.', expectedBy: 'Wed, 30 Sep', on: 'Yesterday, 17:20' },
  },
  {
    id: 't15', owner: ME, title: 'Finalise EQAS corrective action report', priority: 'High', area: 'Quality', due: '18:30', dueDate: '2026-09-29', dueTime: '18:30', bucket: 'today',
    escalation: { reason: 'Information needed', note: 'Need the root cause from Haematology.', on: 'Yesterday, 11:05' },
    returned: { by: 'Priya Sharma', action: 'Provided required information / resource', note: 'Root cause was a reagent lot change. Details added to the CAPA form.', on: 'Today, 07:50' },
  },
  { id: 't10', owner: ME, title: 'Sign off Levey-Jennings charts for September', priority: 'Medium', area: 'Quality', due: 'Yesterday', dueDate: '2026-09-28', bucket: 'done', done: true },
  { id: 't11', owner: ME, title: 'Update reagent lot numbers in LIS', priority: 'Low', area: 'Clinical Operations', due: 'Yesterday', dueDate: '2026-09-28', bucket: 'done', done: true },

  // Other people's tasks. Only Admin and CMD see these.
  { id: 't20', owner: 'Priya Sharma', title: 'Close out IQC failure CAPA — potassium', priority: 'Critical', area: 'Quality', location: 'HYD', due: '12:00', dueDate: '2026-09-29', dueTime: '12:00', bucket: 'today', overdue: true },
  { id: 't21', owner: 'Lakshmi Patel', title: 'Replace LIS interface cable on analyser 4', priority: 'High', area: 'IT', location: 'HYD', due: '13:00', dueDate: '2026-09-29', dueTime: '13:00', bucket: 'today' },
  { id: 't22', owner: 'Kavitha Rao', title: 'Order 40 cold boxes for home collection', priority: 'Medium', area: 'Logistics', location: 'GNT', due: 'Wed, 30 Sep', dueDate: '2026-09-30', bucket: 'upcoming' },
  { id: 't23', owner: 'Sanjay Mehta', title: 'Publish October duty roster', priority: 'Medium', area: 'Human Resources', due: 'Thu, 1 Oct', dueDate: '2026-10-01', bucket: 'upcoming' },
  { id: 't24', owner: 'Suresh Naidu', title: 'Service report for Freezer 2', priority: 'High', area: 'Biomedical Operations', location: 'HYD', due: 'Yesterday', dueDate: '2026-09-28', bucket: 'done', done: true },
];

export type AlertItem = {
  id: string;
  dept: string; // department key
  area: string; // department name
  title: string;
  by: string;
  time: string;
  level: 'red' | 'amber' | 'green';
  escalated?: boolean;
  resolved?: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  resolutionNote?: string;
};

export const alerts: AlertItem[] = [
  { id: 'a1', dept: 'quality', area: 'Quality', title: 'Freezer 2 in sample storage reading −16 °C', by: 'Suresh Naidu', time: '07:08', level: 'red', escalated: true },
  { id: 'a2', dept: 'logistics', area: 'Logistics', title: 'Courier pickup delayed at Guntur collection centre', by: 'Anitha Rao', time: '08:20', level: 'amber' },
  { id: 'a3', dept: 'csd', area: 'Customer Service', title: 'Token display restored after restart', by: 'Kiran Varma', time: '08:45', level: 'green' },
  { id: 'a4', dept: 'it', area: 'IT', title: 'LIS interface to analyser 4 dropping every 20 minutes', by: 'Lakshmi Patel', time: '08:52', level: 'red' },
  { id: 'a5', dept: 'quality', area: 'Quality', title: 'EQA results due for upload by Friday', by: 'Priya Sharma', time: '09:05', level: 'amber' },
];

export type ItemStatus = 'open' | 'done' | 'deviation' | 'na';

export type DiaryKind = 'appointment' | 'focus' | 'reminder' | 'event' | 'meeting';

export type Attendee = { name: string; status: InviteResponse };

export type DiaryEntry = {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // '09:40' or 'All day'
  end?: string;
  kind: DiaryKind;
  title: string;
  body: string;
  // Who the entry belongs to.
  owner: string;
  place?: string;
  attendees?: Attendee[];
  // Where the entry came from. Entries from other modules cannot be edited here.
  source?: 'Meetings' | 'Visits' | 'Review Cadence';
};

export const diaryEntries: DiaryEntry[] = [
  { id: 'd20', owner: 'Priya Sharma', date: '2026-09-29', time: '10:00', end: '10:45', kind: 'meeting', title: 'IQC failure review — potassium', body: 'Root cause and CAPA owner.', place: 'Quality office', attendees: [{ name: 'Anil Reddy', status: 'accepted' }] },
  { id: 'd21', owner: 'Lakshmi Patel', date: '2026-09-29', time: '15:30', end: '16:00', kind: 'appointment', title: 'Vendor call — LIS interface', body: 'Cable replacement and firmware update.', place: 'Phone' },
  { id: 'd22', owner: 'Anil Reddy', date: '2026-09-30', time: '16:00', end: '17:00', kind: 'focus', title: 'Prepare monthly quality report', body: 'September numbers for the CMD review.' },
  { id: 'd1', owner: ME, date: '2026-09-29', time: '07:05', kind: 'reminder', title: 'Freezer 2 door seal loose', body: 'Informed Biomedical. Samples moved to Freezer 1. Recheck temperature at 10:00.' },
  { id: 'd2', owner: ME, date: '2026-09-29', time: '08:05', end: '08:30', kind: 'focus', title: 'Glucose L2 control rerun', body: 'Recalibrated after ±2SD breach. Keep an eye on the next two runs.' },
  { id: 'd3', owner: ME, date: '2026-09-29', time: '09:40', end: '10:00', kind: 'appointment', title: 'Guntur collection centre call', body: 'Courier delayed by 40 minutes. Anitha arranging a backup rider.', place: 'Phone', attendees: [{ name: 'Anitha Rao', status: 'accepted' }] },
  { id: 'd5', owner: ME, date: '2026-09-28', time: '10:15', end: '12:40', kind: 'event', title: 'Guntur collection centre audit', body: 'Site visit from Visit Observations — you are on the visit team.', place: 'TrustLab Collection Centre · Guntur', source: 'Visits', attendees: [{ name: 'Anitha Rao', status: 'accepted' }] },
  { id: 'd6', owner: ME, date: '2026-09-30', time: '09:00', end: '10:00', kind: 'meeting', title: 'Quality — Weekly Review', body: 'Weekly department review with the CMD.', place: 'CMD office', source: 'Review Cadence', attendees: [{ name: 'Anil Reddy', status: 'accepted' }, { name: 'Priya Sharma', status: 'pending' }] },
  { id: 'd7', owner: ME, date: '2026-09-30', time: 'All day', kind: 'reminder', title: 'Prep: NABL surveillance audit', body: 'Collect the last three months of IQC summaries.' },
  { id: 'd8', owner: ME, date: '2026-10-02', time: '14:00', end: '15:00', kind: 'appointment', title: 'Competency assessment — new technicians', body: 'Two technicians. Bring the assessment forms.', place: 'Training room' },
  { id: 'd9', owner: ME, date: '2026-10-06', time: '11:00', end: '12:00', kind: 'event', title: 'Reagent vendor review', body: 'Contract renewal discussion.', place: 'Conference room' },
  { id: 'd10', owner: ME, date: '2026-09-24', time: '16:00', end: '17:00', kind: 'meeting', title: 'NABL audit closing meeting', body: 'Closed with zero NCs.', place: 'Conference room', source: 'Meetings' },
];

export const checklistDates = [
  { id: '2026-09-29', label: 'Tue, 29 Sep 2026', tag: 'Today' },
  { id: '2026-09-28', label: 'Mon, 28 Sep 2026', tag: 'Yesterday' },
  { id: '2026-09-27', label: 'Sun, 27 Sep 2026' },
  { id: '2026-09-26', label: 'Sat, 26 Sep 2026' },
];

// ---------------------------------------------------------------------------
// Lists below mirror the option values used by the website.

export { departments } from './departments';

export const colleagues = [
  { id: 'u1', label: 'Anil Reddy', detail: 'Head · Quality' },
  { id: 'u2', label: 'Priya Sharma', detail: 'Section in-charge · Biochemistry' },
  { id: 'u3', label: 'Suresh Naidu', detail: 'Biomedical engineer' },
  { id: 'u4', label: 'Anitha Rao', detail: 'Logistics coordinator' },
  { id: 'u5', label: 'Kiran Varma', detail: 'Front office lead' },
];

export const upcomingDates = [
  { id: '2026-09-29', label: 'Tue, 29 Sep 2026', tag: 'Today' },
  { id: '2026-09-30', label: 'Wed, 30 Sep 2026', tag: 'Tomorrow' },
  { id: '2026-10-01', label: 'Thu, 1 Oct 2026' },
  { id: '2026-10-02', label: 'Fri, 2 Oct 2026' },
  { id: '2026-10-05', label: 'Mon, 5 Oct 2026' },
  { id: '2026-10-06', label: 'Tue, 6 Oct 2026' },
];

export const taskFrequencies = [
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'biweekly', label: 'Bi-weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'quarterly', label: 'Quarterly' },
  { id: 'annual', label: 'Annual' },
];

export const escalationReasons = [
  { id: 'approval', label: 'Awaiting approval' },
  { id: 'dependency', label: 'Dependency on other team' },
  { id: 'resource', label: 'Resource / access required' },
  { id: 'decision', label: 'Decision required' },
  { id: 'info', label: 'Information needed' },
  { id: 'other', label: 'Other' },
];

export const diaryTypes = [
  { id: 'appointment', label: 'Appointment' },
  { id: 'focus', label: 'Focus / Deep work' },
  { id: 'reminder', label: 'Reminder' },
  { id: 'event', label: 'Event' },
  { id: 'meeting', label: 'Meeting' },
];

export type InviteResponse = 'pending' | 'accepted' | 'tentative' | 'declined';

export type Invite = {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string;
  end?: string;
  place: string;
  by: string;
  // Who was invited.
  to: string;
  agenda?: string[];
  status: InviteResponse;
};

export const invites: Invite[] = [
  {
    id: 'i1', title: 'Weekly quality review', date: '2026-09-29', time: '11:30', end: '12:15',
    place: 'Conference room · NRL Begumpet', by: 'Anil Reddy', to: ME, status: 'pending',
    agenda: ['EQAS results — Haematology', 'Open CAPAs', 'September Levey-Jennings charts'],
  },
  {
    id: 'i2', title: 'NABL surveillance audit prep', date: '2026-10-01', time: '15:00', end: '16:00',
    place: 'Quality office', by: 'Priya Sharma', to: ME, status: 'pending',
    agenda: ['Document list', 'Mock audit plan'],
  },
];


export type { Kpi, PreflightItem } from './departments';

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

export type VisitObservation = {
  id: string;
  category: string;
  text: string;
  evidence?: string;
};

export type VisitAction = {
  id: string;
  text: string;
  // A colleague id, 'me', or '' when nobody is assigned.
  assignee: string;
  due: string; // YYYY-MM-DD, or '' for no date
  priority: Priority;
  done?: boolean;
};

export type VisitMember = { id: string; name: string; lead?: boolean };

export type VisitPhoto = { id: string; uri?: string };

export type Visit = {
  id: string;
  title: string;
  type: string;
  status: 'draft' | 'submitted' | 'reviewed';
  date: string; // YYYY-MM-DD
  org: string;
  branch?: string;
  address?: string;
  city: string;
  state?: string;
  gps?: string;
  hostName?: string;
  hostTitle?: string;
  hostPhone?: string;
  hostEmail?: string;
  timeIn?: string;
  timeOut?: string;
  team: VisitMember[];
  external?: string;
  purpose?: string;
  scope?: string;
  refs?: string;
  tags?: string[];
  assessment?: string;
  summary?: string;
  followUp?: string;
  nextVisit?: string;
  remarks?: string;
  ratings: Record<string, number>;
  observations: VisitObservation[];
  actions: VisitAction[];
  photos: VisitPhoto[];
  owner: string;
  submittedOn?: string;
  reviewedBy?: string;
};

const pics = (prefix: string, n: number): VisitPhoto[] =>
  Array.from({ length: n }, (_, i) => ({ id: `${prefix}-p${i + 1}` }));

export const visits: Visit[] = [
  {
    id: 'v4', title: 'Noida regional lab safety walk', type: 'branch', status: 'submitted',
    date: '2026-09-25', org: 'TrustLab Regional Lab', city: 'Noida', state: 'Uttar Pradesh', timeIn: '10:00', timeOut: '13:00',
    owner: 'Prasad Naidu', submittedOn: 'Fri, 25 Sep · 15:10',
    team: [{ id: 'x1', name: 'Prasad Naidu', lead: true }, { id: 'x2', name: 'Karthik Iyer' }],
    purpose: 'Fire safety and housekeeping walk-through.', assessment: 'improvement',
    summary: 'Two fire exits partly blocked by storage. Extinguisher seals intact.', followUp: 'escalate',
    ratings: { safety: 2, infrastructure: 3 }, photos: pics('v4', 4),
    observations: [
      { id: 'o7', category: 'nc_major', text: 'Fire exit B blocked by reagent cartons.' },
      { id: 'o8', category: 'concern', text: 'Spill kit missing absorbent pads.' },
    ],
    actions: [{ id: 'a4', text: 'Clear fire exit B and mark the floor', assignee: '', due: '2026-09-30', priority: 'Critical' }],
  },
  {
    id: 'v1', title: 'Guntur collection centre audit', type: 'collection', status: 'submitted',
    date: '2026-09-28', org: 'TrustLab Collection Centre', branch: 'Brodipet', city: 'Guntur', state: 'Andhra Pradesh',
    hostName: 'Lakshmi Devi', hostTitle: 'Centre in-charge', hostPhone: '98480 12345',
    timeIn: '10:15', timeOut: '12:40', owner: 'Ravi Kumar', submittedOn: 'Mon, 28 Sep · 17:05',
    team: [{ id: 'me', name: 'Ravi Kumar', lead: true }, { id: 'u4', name: 'Anitha Rao' }],
    purpose: 'Routine quality audit of sample handling and cold chain.',
    scope: 'Phlebotomy area, sample storage, courier handover.',
    assessment: 'satisfactory',
    summary: 'Cold chain is maintained. Courier handover log has gaps on two days.', followUp: 'yes',
    nextVisit: '2026-10-26', tags: ['audit', 'cold-chain'],
    ratings: { infrastructure: 4, quality: 3, safety: 4, documentation: 2 }, photos: pics('v1', 3),
    observations: [
      { id: 'o1', category: 'positive', text: 'Phlebotomy area clean and well labelled.' },
      { id: 'o2', category: 'concern', text: 'Courier handover log not signed on 24 and 26 Sep.', evidence: 'Handover register p. 14' },
      { id: 'o3', category: 'nc_minor', text: 'Ice pack freezer has no temperature chart.' },
    ],
    actions: [
      { id: 'a1', text: 'Put a temperature chart on the ice pack freezer', assignee: 'u4', due: '2026-10-02', priority: 'High' },
      { id: 'a2', text: 'Retrain courier staff on handover sign-off', assignee: 'u4', due: '2026-10-05', priority: 'Medium', done: true },
    ],
  },
  {
    id: 'v2', title: 'Reagent supplier warehouse visit', type: 'supplier', status: 'draft',
    date: '2026-09-29', org: 'MedSupply Distributors', city: 'Hyderabad', timeIn: '09:30',
    owner: 'Ravi Kumar', team: [{ id: 'me', name: 'Ravi Kumar', lead: true }],
    purpose: 'Check storage conditions before contract renewal.',
    ratings: {}, photos: pics('v2', 1), actions: [],
    observations: [{ id: 'o4', category: 'positive', text: 'Cold room at 4 °C with a working alarm.' }],
  },
  {
    id: 'v3', title: 'Anantapur regional lab review', type: 'branch', status: 'reviewed',
    date: '2026-09-17', org: 'TrustLab Regional Lab', city: 'Anantapur', timeIn: '11:00', timeOut: '16:00',
    owner: 'Priya Sharma', submittedOn: 'Thu, 17 Sep · 18:30', reviewedBy: 'Anil Reddy',
    team: [{ id: 'u2', name: 'Priya Sharma', lead: true }, { id: 'me', name: 'Ravi Kumar' }],
    purpose: 'Quarterly review of QC records and staff competency.', assessment: 'good',
    summary: 'Records are complete. Two technicians due for competency assessment.', followUp: 'no',
    ratings: { quality: 4, staff: 3, documentation: 5 }, photos: pics('v3', 5),
    observations: [
      { id: 'o5', category: 'positive', text: 'Levey-Jennings charts reviewed daily and signed.' },
      { id: 'o6', category: 'recommendation', text: 'Schedule competency assessment for new joiners.' },
    ],
    actions: [
      { id: 'a3', text: 'Plan competency assessment for two technicians', assignee: 'me', due: '2026-10-02', priority: 'High' },
    ],
  },
];

export const locations = [
  { id: 'none', label: 'No location' },
  { id: 'HYD', label: 'Hyderabad' },
  { id: 'ATP', label: 'Anantapur' },
  { id: 'BLR', label: 'Bangalore' },
  { id: 'NOI', label: 'Noida' },
  { id: 'CHD', label: 'Chandigarh' },
  { id: 'GNT', label: 'Guntur' },
];

export const resolutionActions = [
  { id: 'approved', label: 'Approved — task can proceed' },
  { id: 'provided', label: 'Provided required information / resource' },
  { id: 'delegated', label: 'Delegated and briefed' },
  { id: 'partial', label: 'Partially resolved — further action needed' },
];



// ---------------------------------------------------------------------------
// History shown under Pre-Operations, Daily Report and Alerts.

export type PreflightPast = {
  date: string;
  by: string;
  at: string | null; // null = still a draft
  missed: number[]; // positions of the checks that were not ticked
  remarks?: string;
};

export const preflightHistory: PreflightPast[] = [
  { date: 'Mon, 28 Sep 2026', by: 'lead', at: '08:42', missed: [] },
  { date: 'Sat, 26 Sep 2026', by: 'lead', at: '08:55', missed: [5], remarks: 'One system was down until 10:00. Checked later in the day.' },
  { date: 'Fri, 25 Sep 2026', by: 'Ravi Kumar', at: '09:20', missed: [3, 4], remarks: 'HOD on leave. Two checks carried to Saturday.' },
  { date: 'Thu, 24 Sep 2026', by: 'lead', at: '08:31', missed: [] },
  { date: 'Wed, 23 Sep 2026', by: 'lead', at: null, missed: [2, 3, 4, 5] },
  { date: 'Tue, 22 Sep 2026', by: 'lead', at: '08:48', missed: [] },
  { date: 'Mon, 21 Sep 2026', by: 'lead', at: '08:39', missed: [1] },
];

export type ReportPast = {
  date: string;
  by: string;
  locked: boolean;
  // One status per daily KPI, in order. Missing = not filled that day.
  statuses: ('good' | 'amber' | 'red')[];
  remarks?: string;
};

export const reportHistory: ReportPast[] = [
  { date: 'Mon, 28 Sep', by: 'lead', locked: true, statuses: ['good', 'good', 'good', 'good', 'amber', 'good'], remarks: 'One item is waiting for a call-back.' },
  { date: 'Sat, 26 Sep', by: 'lead', locked: true, statuses: ['amber', 'red', 'good', 'good', 'amber'], remarks: 'One KPI missed its target. CAPA raised.' },
  { date: 'Fri, 25 Sep', by: 'Ravi Kumar', locked: false, statuses: ['good', 'good'] },
  { date: 'Thu, 24 Sep', by: 'lead', locked: true, statuses: ['good', 'good', 'good', 'good', 'good', 'good'] },
];

export const statusWord = { good: 'On target', amber: 'Watch', red: 'Action' } as const;

export type AlertPast = {
  date: string;
  items: (Pick<AlertItem, 'dept' | 'area' | 'title' | 'level' | 'by' | 'time' | 'escalated'> & {
    resolved: boolean;
  })[];
};

export const alertHistory: AlertPast[] = [
  {
    date: 'Mon, 28 Sep 2026',
    items: [
      { dept: 'quality', area: 'Quality', title: 'IQC failure on analyser 2 — potassium', level: 'red', by: 'Priya Sharma', time: '07:55', escalated: true, resolved: true },
      { dept: 'quality', area: 'Quality', title: 'EQA portal not reachable', level: 'amber', by: 'Anil Reddy', time: '09:10', resolved: true },
      { dept: 'it', area: 'IT', title: 'Night backup finished 40 minutes late', level: 'amber', by: 'Lakshmi Patel', time: '08:15', resolved: true },
    ],
  },
  {
    date: 'Sat, 26 Sep 2026',
    items: [
      { dept: 'quality', area: 'Quality', title: 'Critical value reported late (2 cases)', level: 'red', by: 'Anil Reddy', time: '11:40', escalated: true, resolved: false },
      { dept: 'logistics', area: 'Logistics', title: 'Cold box shortage for home collection', level: 'amber', by: 'Kavitha Rao', time: '10:05', resolved: true },
    ],
  },
  {
    date: 'Thu, 24 Sep 2026',
    items: [
      { dept: 'quality', area: 'Quality', title: 'NABL surveillance audit closed with zero NCs', level: 'green', by: 'Anil Reddy', time: '16:20', resolved: false },
    ],
  },
];
