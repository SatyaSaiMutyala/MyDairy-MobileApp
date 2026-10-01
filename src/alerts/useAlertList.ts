import { useMemo } from 'react';
import { AlertFilters, useAlertsInfiniteQuery } from '../store/api/alertsApi';
import { toAlert } from './model';

// One paged alert list. Rows from every loaded page are joined; the next page
// is asked for with loadMore().
export function useAlertList(filters: AlertFilters) {
  const query = useAlertsInfiniteQuery(filters);

  // The answer for exactly these filters. Empty until it arrives, so "nothing
  // here" is never shown while the list is still being fetched.
  const current = query.currentData;
  const rows = useMemo(
    () => (current?.pages ?? []).flatMap(p => p.data).map(toAlert),
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
    firstLoad: !current && !failed,
    loadingMore: query.isFetchingNextPage,
    hasMore: !!query.hasNextPage,
    // The guard stops a second request while one is already on its way.
    loadMore: () => {
      if (current && query.hasNextPage && !query.isFetching) {
        query.fetchNextPage();
      }
    },
  };
}
