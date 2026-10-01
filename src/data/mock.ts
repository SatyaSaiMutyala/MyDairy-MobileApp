// Small shared choices. Every module's data now comes from the API
// (src/store/api); nothing here is sample data.

export type Priority = 'Critical' | 'High' | 'Medium' | 'Low';

export type ItemStatus = 'open' | 'done' | 'deviation' | 'na';

export const taskFrequencies = [
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'biweekly', label: 'Bi-weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'quarterly', label: 'Quarterly' },
  { id: 'annual', label: 'Annual' },
];
