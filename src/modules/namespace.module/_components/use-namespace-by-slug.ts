"use client";
/**
 * useNamespaceBySlug — client-side hook that fetches a namespace by its slug.
 *
 * Presentation code stays adapter-agnostic and only calls the namespace query
 * facade exposed by the module.
 */

import { useEffect, useState } from "react";
import { getNamespaceBySlug, type NamespaceDTO } from "../core/_queries";

export interface UseNamespaceBySlugResult {
  namespace: NamespaceDTO | null;
  loading: boolean;
  error: string | null;
  /** Re-fetch (e.g., after saving settings). */
  refresh: () => void;
}

/**
 * Fetches the namespace record identified by `slug`.
 * Returns { namespace, loading, error, refresh }.
 * Pass undefined/null to skip fetching until the slug is resolved.
 */
export function useNamespaceBySlug(
  slug: string | null | undefined,
): UseNamespaceBySlugResult {
  const [namespace, setNamespace] = useState<NamespaceDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!slug) {
      setNamespace(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    getNamespaceBySlug(slug)
      .then((result) => {
        if (cancelled) return;
        if (result.ok) {
          setNamespace(result.value);
        } else {
          setError(result.error?.message ?? "Failed to load namespace");
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug, tick]);

  const refresh = () => setTick((n) => n + 1);

  return { namespace, loading, error, refresh };
}
