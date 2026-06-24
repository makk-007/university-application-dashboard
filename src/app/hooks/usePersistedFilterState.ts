import { useEffect, useState, Dispatch, SetStateAction } from "react";

/**
 * Like useState, but the value is persisted to localStorage under the
 * given key and restored on mount. Used for filter, sort, and search
 * preferences that should survive navigating away and coming back, or
 * closing and reopening the app, but never for selection state,
 * pagination, or anything tied to a specific session's transient UI.
 *
 * Persists whatever value is passed; intended for simple values
 * (strings, booleans) rather than complex objects, since this app's
 * filter state is all simple values. Supports the same functional
 * updater form as React's native useState setter.
 */
export function usePersistedFilterState<T extends string | boolean>(
  key: string,
  defaultValue: T,
): [T, Dispatch<SetStateAction<T>>] {
  const storageKey = `uat-filter-${key}`;

  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw === null) return defaultValue;
      return JSON.parse(raw) as T;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(value));
    } catch {
      // Storage can fail (quota, private browsing); losing a saved filter
      // preference is not worth surfacing an error for.
    }
  }, [storageKey, value]);

  return [value, setValue];
}
