import { useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useAppDispatch } from './store';
import { refresh, Tag } from './api/baseApi';

// Keeps a screen's data fresh: it is fetched again each time the screen
// comes back into view (the first view already fetched), and the returned
// function does the same on demand, e.g. for pull-to-refresh. Only queries
// carrying these tags are asked again.
export function useFresh(tags: readonly Tag[]) {
  const dispatch = useAppDispatch();
  const first = useRef(true);

  const again = useCallback(async () => {
    const result = dispatch(refresh(tags));
    // invalidateTags starts the refetches; give them a moment to land so
    // pull-to-refresh spins for the real wait rather than an instant.
    await new Promise<void>(done => setTimeout(done, 700));
    return result;
  }, [dispatch, tags]);

  useFocusEffect(
    useCallback(() => {
      if (first.current) {
        first.current = false;
        return;
      }
      dispatch(refresh(tags));
    }, [dispatch, tags]),
  );

  return again;
}
