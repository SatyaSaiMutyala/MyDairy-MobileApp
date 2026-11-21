import { useEffect } from 'react';
import notifee from '@notifee/react-native';
import { useRemindersInfiniteQuery } from '../store/api/remindersApi';
import { handleAlarmEvent, syncAlarms } from './alarms';

const UPCOMING = { box: 'upcoming' as const };

// Keeps the phone's local alarms in step with the reminders set for this
// person. The list is read again whenever the app comes back to the
// foreground or a reminder push arrives, and every change re-books the alarms.
export function useReminderAlarms() {
  const query = useRemindersInfiniteQuery(UPCOMING);
  const { hasNextPage, isFetching, fetchNextPage, currentData } = query;

  // All pages, so a long list never leaves a reminder unbooked.
  useEffect(() => {
    if (hasNextPage && !isFetching) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetching, fetchNextPage]);

  useEffect(() => {
    if (!currentData || hasNextPage) {
      return;
    }
    syncAlarms(currentData.pages.flatMap(p => p.data));
  }, [currentData, hasNextPage]);

  // Taps and Stop while the app is open.
  useEffect(() => notifee.onForegroundEvent(handleAlarmEvent), []);
}
