"use client";
/**
 * useWorkItems — client-side hook that fetches work items for a workspace.
 *
 * Source equivalent: workspace.slice/domain.tasks/_hooks/use-work-items.ts
 * Adapted: uses FirestoreWorkItemRepository (Web SDK) + getWorkItemsByWorkspace
 * use-case. Returns sorted items (by createdAt desc).
 *
 * Refreshes when workspaceId changes or `refresh()` is called.
 */

import { useEffect, useMemo, useState } from "react";
import { FirestoreWorkItemRepository } from "@/modules/work.module/infra.firestore/_repository";
import {
  getWorkItemsByWorkspace,
  type WorkItemDTO,
} from "@/modules/work.module/core/_use-cases";

export interface UseWorkItemsResult {
  items: WorkItemDTO[];
  loading: boolean;
  error: string | null;
  /** Re-fetch (e.g., after creating or updating a task). */
  refresh: () => void;
}

/**
 * Fetches all work items for the given workspaceId.
 * Pass undefined/null to skip fetching until the workspace is resolved.
 */
export function useWorkItems(
  workspaceId: string | null | undefined,
): UseWorkItemsResult {
  const [items, setItems] = useState<WorkItemDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const repo = useMemo(() => new FirestoreWorkItemRepository(), []);

  useEffect(() => {
    if (!workspaceId) {
      setItems([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    getWorkItemsByWorkspace(repo, workspaceId)
      .then((result) => {
        if (cancelled) return;
        if (result.ok) {
          const sorted = [...result.value].sort((a, b) => {
            const ta = new Date(a.createdAt).getTime();
            const tb = new Date(b.createdAt).getTime();
            return tb - ta;
          });
          setItems(sorted);
        } else {
          setError(result.error?.message ?? "Failed to load work items");
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
  }, [workspaceId, repo, tick]);

  const refresh = () => setTick((n) => n + 1);

  return { items, loading, error, refresh };
}
