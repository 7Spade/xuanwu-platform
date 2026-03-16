"use client";
/**
 * Shared React hooks — reusable state management and browser API patterns.
 *
 * These are utility hooks for:
 * - State management: useToggle, usePrevious
 * - Storage: useLocalStorage
 * - Performance: useDebounce
 * - Lifecycle: useIsMounted
 * - Cross-cutting concerns: useLocale (i18n), useAuthState (auth observation)
 *
 * Import via: import { useToggle, useDebounce } from "@/shared/hooks";
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { getAuth, onAuthStateChanged, type User } from "firebase/auth";
import { getFirebaseApp } from "@/infrastructure/firebase/app";
import { DEFAULT_LOCALE } from "@/shared/constants";
import { resolveLocale } from "@/shared/i18n";
import type { Locale } from "@/shared/types";

// ---------------------------------------------------------------------------
// useToggle
// ---------------------------------------------------------------------------

/**
 * Boolean toggle hook — manages a boolean state with a toggle function.
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

// ---------------------------------------------------------------------------
// useLocale
// ---------------------------------------------------------------------------

/** localStorage key used to persist the user's locale preference. */
export const LOCALE_STORAGE_KEY = "xuanwu-locale";

/**
 * Locale persistence hook — implements `ILocalePort` for client components.
 *
 * Reads the user's locale preference from `localStorage` (via `useLocalStorage`),
 * falling back to `DEFAULT_LOCALE`. Automatically keeps `html[lang]` in sync
 * for accessibility and search engine crawlers.
 *
 * Satisfies the `ILocalePort` contract from `@/shared/ports`.
 *
 * @example
 * const [locale, setLocale] = useLocale();
 * // locale === "zh-TW" | "en"
 * // setLocale("en") → persists to localStorage + updates html[lang]
 */
export function useLocale(): [Locale, (locale: Locale) => void] {
  const [raw, setRaw] = useLocalStorage<string>(LOCALE_STORAGE_KEY, DEFAULT_LOCALE);
  const locale = resolveLocale(raw);

  // Keep html[lang] attribute in sync whenever the locale changes
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback(
    (next: Locale) => {
      setRaw(next);
    },
    [setRaw],
  );

  return [locale, setLocale];
}

// ---------------------------------------------------------------------------
// useAuthState
// ---------------------------------------------------------------------------

/** Return value of `useAuthState`. */
export interface AuthState {
  /** Firebase Auth user, or `null` when signed out. */
  user: User | null;
  /** `true` while the initial auth-state resolution is in-flight. */
  loading: boolean;
}

/**
 * Lightweight auth-state hook — implements `IAuthPort` observation for
 * client components that are outside the `<AccountProvider>` tree (e.g. the
 * marketing homepage).
 *
 * Listens to `onAuthStateChanged` and surfaces the current `User` object.
 * Avoids loading the full `AccountDTO`; use `useCurrentAccount` inside
 * `(main)` routes when the full profile is needed.
 *
 * @example
 * const { user, loading } = useAuthState();
 * if (!loading && user) { ... }
 */
export function useAuthState(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth(getFirebaseApp());
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { user, loading };
}
