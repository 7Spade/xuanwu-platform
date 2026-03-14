"use client";
/**
 * useWorkspaces — client-side hook that fetches workspaces for a dimension (account).
 *
 * Source equivalent: workspace.slice/core/_hooks/use-workspaces.ts
 * Adapted: uses FirestoreWorkspaceRepository (Web SDK) + getWorkspacesByDimension
 * use-case to load workspaces for the current user's dimension ID.
 *
 * Refreshes when dimensionId changes (e.g., on org switch).
 */

import { useEffect, useMemo, useState } from "react";
import { FirestoreWorkspaceRepository } from "../infra.firestore/_repository";
import {
  getWorkspacesByDimension,
  type WorkspaceDTO,
} from "../core/_use-cases";

export interface UseWorkspacesResult {
  workspaces: WorkspaceDTO[];
  loading: boolean;
  error: string | null;
  /** Re-fetch workspaces (e.g., after creating a new one). */
  refresh: () => void;
}

/**
 * Fetches workspaces for the given dimensionId (account ID).
 * Returns { workspaces, loading, error, refresh }.
 * Pass undefined/null to skip fetching until the user is resolved.
 */
export function useWorkspaces(
  dimensionId: string | null | undefined,
): UseWorkspacesResult {
  const [workspaces, setWorkspaces] = useState<WorkspaceDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  // Repository is a thin wrapper around the Firestore singleton — memoize to
  // avoid unnecessary object allocation on every dimensionId / tick change.
  const repo = useMemo(() => new FirestoreWorkspaceRepository(), []);

  useEffect(() => {
    if (!dimensionId) {
      setWorkspaces([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    getWorkspacesByDimension(repo, dimensionId)
      .then((result) => {
        if (cancelled) return;
        if (result.ok) {
          setWorkspaces(result.value);
        } else {
          setError(result.error?.message ?? "Failed to load workspaces");
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
  }, [dimensionId, repo, tick]);

  const refresh = () => setTick((n) => n + 1);

  return { workspaces, loading, error, refresh };
}
