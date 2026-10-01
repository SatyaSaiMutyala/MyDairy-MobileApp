import { useMemo } from 'react';
import { TaskFilters, useTasksInfiniteQuery } from '../store/api/tasksApi';
import { toTask } from './model';

// One paged task list. Rows from every loaded page are joined; the next page
// is asked for with loadMore().
export function useTaskList(filters: TaskFilters, skip = false) {
  const query = useTasksInfiniteQuery(filters, { skip });

  // The answer for exactly these filters. Empty until it arrives, so "nothing
  // here" is never shown while the list is still being fetched.
  const current = query.currentData;
  const rows = useMemo(
    () => (current?.pages ?? []).flatMap(p => p.data).map(toTask),
    [current],
  );
  const first = current?.pages[0];
  const failed = !current && !!query.error;

  return {
    rows,
    total: first?.meta.total ?? 0,
    counts: first?.counts,
    error: query.error,
    failed,
    firstLoad: !current && !failed && !skip,
    loadingMore: query.isFetchingNextPage,
    hasMore: !!query.hasNextPage,
    // The guard stops a second request while one is already on its way.
    loadMore: () => {
      if (current && query.hasNextPage && !query.isFetching) {
        query.fetchNextPage();
      }
    },
    refetch: query.refetch,
  };
}
