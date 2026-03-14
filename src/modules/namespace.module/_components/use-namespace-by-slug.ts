"use client";
/**
 * useNamespaceBySlug — client-side hook that fetches a namespace by its slug.
 *
 * Source equivalent: organization.slice/core/_hooks/use-org.ts (slug variant)
 * Adapted: uses FirestoreNamespaceRepository (Web SDK) + getNamespaceBySlug
 * use-case to load a namespace from a route slug (e.g. `[slug]` param).
 *
 * Used by org-settings pages (general, billing) which receive the slug from
 * the URL rather than from AccountProvider.
 */

import { useEffect, useMemo, useState } from "react";
import { FirestoreNamespaceRepository } from "../infra.firestore/_repository";
import {
  getNamespaceBySlug,
  type NamespaceDTO,
} from "../core/_use-cases";

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

  const repo = useMemo(() => new FirestoreNamespaceRepository(), []);

  useEffect(() => {
    if (!slug) {
      setNamespace(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    getNamespaceBySlug(repo, slug)
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
  }, [slug, repo, tick]);

  const refresh = () => setTick((n) => n + 1);

  return { namespace, loading, error, refresh };
}
