"use client";
/**
 * useWorkspace — client-side hook that fetches a single workspace by ID.
 *
 * Source equivalent: workspace.slice/core/_hooks/use-workspace.ts
 * Adapted: uses FirestoreWorkspaceRepository (Web SDK) + getWorkspaceById
 * use-case. Reuses the same memoized-repository pattern as useWorkspaces.
 *
 * Returns { workspace, loading, error }.
 */

import { useEffect, useMemo, useState } from "react";

import { getWorkspaceById, type WorkspaceDTO } from "../core/_use-cases";
import { FirestoreWorkspaceRepository } from "../infra.firestore/_repository";

export interface UseWorkspaceResult {
  workspace: WorkspaceDTO | null;
  loading: boolean;
  error: string | null;
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

  const repo = useMemo(() => new FirestoreWorkspaceRepository(), []);

  useEffect(() => {
    if (!workspaceId) {
      setWorkspace(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    getWorkspaceById(repo, workspaceId)
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
  }, [workspaceId, repo]);

  return { workspace, loading, error };
}
