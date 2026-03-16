"use client";
/**
 * useWorkspace — client-side hook that fetches a single workspace by ID.
 *
 * Presentation code stays adapter-agnostic and only calls the workspace query
 * facade exposed by the module.
 *
 * Returns { workspace, loading, error, refresh }.
 */

import { useCallback, useEffect, useState } from "react";

import { getWorkspaceById, type WorkspaceDTO } from "../core/_queries";

export interface UseWorkspaceResult {
  workspace: WorkspaceDTO | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

/**
 * Fetches a single workspace by `workspaceId`.
 * Pass `null | undefined` to skip fetching until the ID is resolved.
 */
export function useWorkspace(
  workspaceId: string | null | undefined,
): UseWorkspaceResult {
  const [workspace, setWorkspace] = useState<WorkspaceDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    if (!workspaceId) {
      setWorkspace(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    getWorkspaceById(workspaceId)
      .then((result) => {
        if (cancelled) return;
        if (result.ok) {
          setWorkspace(result.value);
        } else {
          setError(result.error?.message ?? "Failed to load workspace");
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
    // `repo` is stable (useMemo []). `tick` re-runs the effect on refresh().
    // `refresh` itself is not listed because it is stable (useCallback []).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId, tick]);

  return { workspace, loading, error, refresh };
}
