import type { PageMeta } from './api/labApi';

type Paged<T> = { data: T[]; meta: PageMeta };

type InfiniteResult<T> = {
  currentData?: { pages: Paged<T>[] };
  error?: unknown;
  hasNextPage?: boolean;
  isFetching: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => unknown;
};

// Joins the pages of an RTK infinite query into one list, with the flags a
// screen needs: shimmer on first load, shimmer at the end while loading more.
export function pagesOf<T>(query: InfiniteResult<T>) {
  // The answer for exactly these arguments. Empty until it arrives, so
  // "nothing here" is never shown while the list is still being fetched.
  const current = query.currentData;
  const failed = !current && !!query.error;
  return {
    rows: (current?.pages ?? []).flatMap(p => p.data),
    total: current?.pages[0]?.meta.total ?? 0,
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
