"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// ---------------------------------------------------------------------------
// useToggle
// ---------------------------------------------------------------------------

/**
 * Boolean toggle directive.
 *
 * @example
 * const [isOpen, toggle, setIsOpen] = useToggle(false);
 */
export function useToggle(
  initial = false,
): [boolean, () => void, (value: boolean) => void] {
  const [value, setValue] = useState(initial);
  const toggle = useCallback(() => setValue((v) => !v), []);
  return [value, toggle, setValue];
}

// ---------------------------------------------------------------------------
// useDebounce
// ---------------------------------------------------------------------------

/**
 * Debounce a value by the given delay in milliseconds.
 *
 * @example
 * const debouncedSearch = useDebounce(searchTerm, 300);
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

// ---------------------------------------------------------------------------
// useLocalStorage
// ---------------------------------------------------------------------------

/**
 * Persist state in localStorage with JSON serialisation.
 *
 * @example
 * const [theme, setTheme] = useLocalStorage("theme", "light");
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const next = typeof value === "function" ? (value as (p: T) => T)(prev) : value;
        try {
          window.localStorage.setItem(key, JSON.stringify(next));
        } catch {
          // Ignore write errors (e.g. private browsing quota)
        }
        return next;
      });
    },
    [key],
  );

  return [storedValue, setValue];
}

// ---------------------------------------------------------------------------
// usePrevious
// ---------------------------------------------------------------------------

/**
 * Track the previous value of a variable.
 * Returns `undefined` on the first render; returns the value from the previous
 * render on all subsequent renders.
 *
 * @example
 * const prevCount = usePrevious(count);
 */
export function usePrevious<T>(value: T): T | undefined {
  const prevRef = useRef<T | undefined>(undefined);
  const currentRef = useRef<T>(value);

  useEffect(() => {
    prevRef.current = currentRef.current;
    currentRef.current = value;
  });

  return prevRef.current;
}

// ---------------------------------------------------------------------------
// useIsMounted
// ---------------------------------------------------------------------------

/**
 * Returns `true` once the component is mounted (client-side only).
 * Useful for avoiding hydration mismatches.
 *
 * @example
 * const isMounted = useIsMounted();
 */
export function useIsMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
