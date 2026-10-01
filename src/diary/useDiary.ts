import { useEffect, useMemo } from 'react';
import {
  useDiaryInfiniteQuery,
  useNextMeetingQuery,
} from '../store/api/diaryApi';
import { addDays, monthGrid, realToday } from '../utils/dates';
import { toLine } from './model';

// Everything on the calendar for the month that holds the given day. The
// range is whole weeks, so the week strip is covered too. The API pages the
// list; the pages are fetched one after another until the month is complete.
export function useDiaryMonth(day: string) {
  const range = useMemo(() => {
    const weeks = monthGrid(day);
    return { date_from: weeks[0][0], date_to: weeks[weeks.length - 1][6] };
  }, [day.slice(0, 7)]); // eslint-disable-line react-hooks/exhaustive-deps

  const query = useDiaryInfiniteQuery(range);
  const { hasNextPage, isFetching, fetchNextPage } = query;
  useEffect(() => {
    if (hasNextPage && !isFetching) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetching, fetchNextPage]);

  // The answer for exactly this month; empty while it is being fetched.
  const current = query.currentData;
  const lines = useMemo(
    () => (current?.pages ?? []).flatMap(p => p.data).map(toLine),
    [current],
  );
  const failed = !current && !!query.error;

  return {
    lines,
    // Entries per day, for the dots on the calendar.
    counts: current?.pages[0]?.days ?? {},
    error: query.error,
    failed,
    loading: !current && !failed,
  };
}

// The next meeting from today onwards, for the Home screen.
export function useNextMeeting() {
  const today = realToday();
  const arg = useMemo(
    () => ({ date_from: today, date_to: addDays(today, 60) }),
    [today],
  );
  const query = useNextMeetingQuery(arg);
  return {
    meeting: query.currentData ? toLine(query.currentData) : undefined,
    loading: query.currentData === undefined && !query.error,
  };
}
