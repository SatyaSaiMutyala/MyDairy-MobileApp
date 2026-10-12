import { baseApi } from './baseApi';

// The "At a glance" numbers on Home: due today and overdue, for the four
// modules. Shapes exactly as the API sends them.
export type GlanceCounts = {
  tasks: number;
  meetings: number;
  reminders: number;
  projects: number;
};

export type HomeSummary = {
  ok: true;
  dueToday: GlanceCounts;
  overdue: GlanceCounts;
};

export const homeApi = baseApi.injectEndpoints({
  endpoints: build => ({
    homeSummary: build.query<HomeSummary, void>({
      query: () => 'home/summary',
      // Any change in these modules can move a number.
      providesTags: ['Tasks', 'Meetings', 'Reminders', 'Projects'],
    }),
  }),
});

export const { useHomeSummaryQuery } = homeApi;
