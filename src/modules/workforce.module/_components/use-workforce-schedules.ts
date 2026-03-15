"use client";
/**
 * useWorkforceSchedules — fetches schedule assignments for a workspace.
 *
 * Wave 59: presentation hook for workforce.module.
 * Pattern: memoized FirestoreScheduleRepository → getSchedulesByWorkspace.
 * Returns { schedules, loading, error, refresh }.
 */

import { useState, useEffect, useMemo, useCallback } from "react";
import { FirestoreScheduleRepository } from "../infra.firestore/_repository";
import { getSchedulesByWorkspace, type ScheduleDTO } from "../core/_use-cases";

export interface UseWorkforceSchedulesResult {
  schedules: ScheduleDTO[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useWorkforceSchedules(
  workspaceId: string | null | undefined,
): UseWorkforceSchedulesResult {
  const repo = useMemo(() => new FirestoreScheduleRepository(), []);
  const [schedules, setSchedules] = useState<ScheduleDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    if (!workspaceId) {
      setSchedules([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    getSchedulesByWorkspace(repo, workspaceId).then((result) => {
      if (cancelled) return;
      if (result.ok) {
        setSchedules(result.value);
      } else {
        setError(result.error.message);
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [repo, workspaceId, tick]);

  return { schedules, loading, error, refresh };
}
