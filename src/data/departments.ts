import raw from './departments.data.json';

// Every department's KPIs and morning checks, exported from the website
// (config/departments.php). Regenerate the JSON when the website list changes.

export type Importance = 'critical' | 'high' | 'medium' | 'low';
export type CheckPriority = 'critical' | 'high' | 'standard';

export type Kpi = {
  id: string;
  name: string;
  target?: string;
  frequency: string;
  importance: Importance;
  due: 'today' | 'event' | 'later';
  dueOn?: string;
  last?: string;
};

export type PreflightItem = { ref: string; text: string; priority: CheckPriority };

export type Department = {
  id: string;
  name: string;
  lead: string;
  owner: string;
  loc: string;
  kpis: Kpi[];
  preflight: PreflightItem[];
};

// Frequencies with no calendar: filled only when the event happens.
const EVENT = ['per event', 'per cycle', 'per inspection', 'per collection', 'audit cycle', 'per meeting'];

// When each scheduled frequency is next due, seen from 29 Sep 2026.
const NEXT_DUE: Record<string, string> = {
  weekly: 'Fri, 2 Oct',
  monthly: '30 Sep',
  'monthly test': '30 Sep',
  quarterly: '31 Dec',
  '6-monthly': '31 Mar',
  annual: '31 Mar',
};

const sampleLast = ['98.6%', '100%', '1.4%', '0.3%', undefined, '0.8%'];

export const departmentList: Department[] = raw.map(d => {
  let daily = 0;
  return {
    id: d.id,
    name: d.name,
    lead: d.lead,
    owner: d.owner,
    loc: d.loc,
    preflight: d.preflight as PreflightItem[],
    kpis: d.kpis.map((k, i) => {
      const f = k.frequency.toLowerCase();
      const due = f === 'daily' ? 'today' : EVENT.includes(f) ? 'event' : 'later';
      return {
        id: `${d.id}-${i}`,
        name: k.name,
        target: k.target || undefined,
        frequency: k.frequency,
        importance: k.importance as Importance,
        due,
        dueOn: due === 'later' ? NEXT_DUE[f] : undefined,
        last: due === 'today' ? sampleLast[daily++ % sampleLast.length] : undefined,
      };
    }),
  };
});

export const departments = departmentList.map(d => ({ id: d.id, label: d.name }));

export const departmentOf = (id: string) =>
  departmentList.find(d => d.id === id) ?? departmentList[0];

export const departmentName = (id: string) => departmentOf(id).name;
