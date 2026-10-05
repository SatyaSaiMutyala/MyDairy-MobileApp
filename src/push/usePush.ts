import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useAppDispatch } from '../store';
import { refresh, Tag } from '../store/api/baseApi';
import { notificationsApi } from '../store/api/notificationsApi';
import { listenForPushes, pushToken } from './index';

let current: string | null = null;

// A push says something changed: which cached data to fetch again, by the
// start of its kind ('task.escalated' → task).
const byModule: Record<string, Tag[]> = {
  task: ['Tasks', 'Task'],
  alert: ['Alerts', 'Alert'],
  diary: ['Diary', 'DiaryInvites', 'DiaryEntry'],
  visit: ['Visits', 'Visit', 'Tasks'],
  lab: ['LabState', 'LabHistory', 'LabRecord'],
  preops: ['PreOps', 'PreOpsHistory'],
  report: ['Report', 'ReportHistory'],
  meeting: ['Meetings', 'Meeting', 'Diary'],
  discussion: ['Discussions', 'Discussion'],
  project: ['Projects', 'Project', 'Tasks'],
  activity: ['Activity', 'ActivityHistory', 'ActivityOverview'],
};
const tagsFor = (kind?: string): Tag[] => [
  'Notices',
  ...(byModule[(kind ?? '').split('.')[0]] ?? []),
];

// The address last given to the server, so sign-out can take it back.
export const lastPushToken = () => current;

// Runs while someone is signed in: gives the server this phone's push
// address, and keeps the bell fresh when a push arrives.
export function usePush() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const register = (token: string) => {
      current = token;
      dispatch(
        notificationsApi.endpoints.registerDevice.initiate({
          token,
          platform: Platform.OS === 'ios' ? 'ios' : 'android',
        }),
      );
    };

    pushToken().then(token => token && register(token));
    return listenForPushes({
      onArrive: kind => dispatch(refresh(tagsFor(kind))),
      onNewToken: register,
    });
  }, [dispatch]);
}
