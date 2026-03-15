"use client";
/**
 * useAchievements — fetches achievement records for a specific account.
 *
 * Wave 56: presentation hook for achievement.module.
 * Pattern: memoized FirestoreAchievementRepository → getAchievementsByAccount.
 * Returns { achievements, loading, error }.
 */

import { useState, useEffect, useMemo } from "react";
import { FirestoreAchievementRepository } from "../infra.firestore/_repository";
import { getAchievementsByAccount, type AchievementDTO } from "../core/_use-cases";

export interface UseAchievementsResult {
  achievements: AchievementDTO[];
  loading: boolean;
  error: string | null;
}

export function useAchievements(
  accountId: string | null | undefined,
): UseAchievementsResult {
  const repo = useMemo(() => new FirestoreAchievementRepository(), []);
  const [achievements, setAchievements] = useState<AchievementDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accountId) {
      setAchievements([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    getAchievementsByAccount(repo, accountId).then((result) => {
      if (cancelled) return;
      if (result.ok) {
        setAchievements(result.value);
      } else {
        setError(result.error.message);
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [repo, accountId]);

  return { achievements, loading, error };
}
