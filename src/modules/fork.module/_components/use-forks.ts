"use client";
/**
 * useForks — fetches fork records for a workspace (by origin workspace ID).
 *
 * Wave 58: presentation hook for fork.module.
 * Pattern: direct Firestore query for workspace-scoped forks.
 */

import { useState, useEffect, useCallback } from "react";
import { getFirestore, collection, getDocs, query, where, QueryDocumentSnapshot } from "firebase/firestore";
import type { ForkDTO } from "../core/_use-cases";

interface ForkDoc {
  originWorkspaceId: string;
  forkedByAccountId: string;
  baselineVersion: string;
  status: string;
  createdAt: string;
}

function docToForkDTO(d: QueryDocumentSnapshot): ForkDTO {
  const data = d.data() as ForkDoc;
  return {
    id: d.id,
    originWorkspaceId: data.originWorkspaceId,
    forkedByAccountId: data.forkedByAccountId,
    baselineVersion: data.baselineVersion,
    status: data.status as ForkDTO["status"],
    createdAt: data.createdAt,
  };
}

async function fetchForksByWorkspace(workspaceId: string): Promise<ForkDTO[]> {
  try {
    const db = getFirestore();
    const col = collection(db, "forks");
    const q = query(col, where("originWorkspaceId", "==", workspaceId));
    const snap = await getDocs(q);
    return snap.docs.map(docToForkDTO);
  } catch {
    return [];
  }
}

export interface UseForksResult {
  forks: ForkDTO[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useForks(workspaceId: string | null | undefined): UseForksResult {
  const [forks, setForks] = useState<ForkDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    if (!workspaceId) {
      setForks([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchForksByWorkspace(workspaceId)
      .then((data) => {
        if (!cancelled) setForks(data);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [workspaceId, tick]);

  return { forks, loading, error, refresh };
}
