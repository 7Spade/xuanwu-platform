"use client";
/**
 * useNamespace — client-side hook that fetches the namespace (org) for a given owner.
 *
 * Source equivalent: organization.slice/core/_hooks/use-org.ts
 * Adapted: uses FirestoreNamespaceRepository (Web SDK) + getNamespaceByOwnerId
 * use-case to load the current user's namespace.
 *
 * Returns null namespace when the user has not yet created an org/namespace.
 */

import { useEffect, useState } from "react";
import {
  getNamespaceByOwnerId,
  type NamespaceDTO,
} from "@/modules/namespace.module";

export interface UseNamespaceResult {
  namespace: NamespaceDTO | null;
  loading: boolean;
  error: string | null;
  /** Re-fetch (e.g., after creating or updating the org). */
  refresh: () => void;
}

/**
 * Fetches the namespace record for the given ownerId (account ID).
 * Returns { namespace, loading, error, refresh }.
 * Pass undefined/null to skip fetching until the user is resolved.
 */
export function useNamespace(
  ownerId: string | null | undefined,
): UseNamespaceResult {
  const [namespace, setNamespace] = useState<NamespaceDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!ownerId) {
      setNamespace(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    getNamespaceByOwnerId(ownerId)
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
  }, [ownerId, tick]);

  const refresh = () => setTick((n) => n + 1);

  return { namespace, loading, error, refresh };
}
