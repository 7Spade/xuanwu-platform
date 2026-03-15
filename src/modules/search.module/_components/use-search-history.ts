"use client";
/**
 * useSearchHistory — manages a localStorage-backed list of recent search queries.
 *
 * Wave 61: search history for `search.module`.
 *
 * Stores the 10 most recent unique queries in localStorage under
 * "xuanwu:search:history".  Exposes:
 *   - history: string[]   — most recent first
 *   - push(query)         — prepend + deduplicate + persist
 *   - clear()             — wipe the list
 */

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "xuanwu:search:history";
const MAX_HISTORY = 10;

function readHistory(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is string => typeof v === "string").slice(0, MAX_HISTORY);
  } catch {
    return [];
  }
}

function writeHistory(items: string[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_HISTORY)));
  } catch {
    // ignore quota errors
  }
}

export interface UseSearchHistoryResult {
  history: string[];
  push: (query: string) => void;
  clear: () => void;
}

export function useSearchHistory(): UseSearchHistoryResult {
  const [history, setHistory] = useState<string[]>([]);

  // Hydrate from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    setHistory(readHistory());
  }, []);

  const push = useCallback((query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setHistory((prev) => {
      const next = [trimmed, ...prev.filter((q) => q !== trimmed)].slice(
        0,
        MAX_HISTORY,
      );
      writeHistory(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setHistory([]);
    writeHistory([]);
  }, []);

  return { history, push, clear };
}
