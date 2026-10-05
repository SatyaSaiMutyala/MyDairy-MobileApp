import type { PillTone } from '../components/Pill';
import type { MilestoneStatus, ProjectStatus } from '../store/api/projectsApi';
import { colors } from '../theme';

export const projectTone: Record<ProjectStatus, PillTone> = {
  planning: 'low',
  active: 'info',
  at_risk: 'watch',
  overdue: 'critical',
  on_hold: 'low',
  completed: 'signed',
};

export const milestoneTone: Record<MilestoneStatus, PillTone> = {
  not_started: 'low',
  in_progress: 'info',
  at_risk: 'watch',
  blocked: 'critical',
  completed: 'signed',
  deferred: 'low',
};

// Bar colour: red when late, amber when at risk, green when done.
export const progressColor = (status: ProjectStatus | MilestoneStatus) =>
  status === 'overdue' || status === 'blocked'
    ? colors.red
    : status === 'at_risk'
    ? colors.amber
    : status === 'completed'
    ? colors.green
    : colors.teal;

export const priorityLabel = (p: string) => p.charAt(0).toUpperCase() + p.slice(1);
