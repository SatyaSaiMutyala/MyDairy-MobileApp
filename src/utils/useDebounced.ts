import { useEffect, useState } from 'react';

// The value, once it has stopped changing for a moment. Used so a search box
// asks the server after the person pauses, not on every letter.
export function useDebounced<T>(value: T, wait = 350): T {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setSettled(value), wait);
    return () => clearTimeout(timer);
  }, [value, wait]);
  return settled;
}
