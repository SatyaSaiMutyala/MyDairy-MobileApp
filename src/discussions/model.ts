import type { PillTone } from '../components/Pill';
import type { Outcome } from '../store/api/discussionsApi';

export const outcomeTone: Record<Outcome, PillTone> = {
  positive: 'good',
  neutral: 'low',
  concern: 'watch',
  escalation: 'critical',
  decision: 'info',
  deferred: 'low',
};
