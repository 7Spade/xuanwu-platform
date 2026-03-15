"use client";
/**
 * useSocialFeed — loads social relations for an account to build a feed.
 *
 * Wave 60: returns the full list of social relations for a given subject
 * account (starred workspaces, followed accounts, etc.), sorted by createdAt.
 */

import { useEffect, useMemo, useState } from "react";
import { FirestoreSocialGraphRepository } from "../infra.firestore/_repository";
import { getRelationsBySubject } from "../core/_use-cases";
import type { SocialRelationDTO } from "../core/_use-cases";

export interface UseSocialFeedResult {
  relations: SocialRelationDTO[];
  loading: boolean;
  error: string | null;
}

let _repo: FirestoreSocialGraphRepository | null = null;
function getRepo() {
  if (!_repo) _repo = new FirestoreSocialGraphRepository();
  return _repo;
}

export function useSocialFeed(
  accountId: string | null | undefined,
): UseSocialFeedResult {
  const [relations, setRelations] = useState<SocialRelationDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accountId) {
      setRelations([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    getRelationsBySubject(getRepo(), accountId).then((result) => {
      if (cancelled) return;
      if (result.ok) {
        const sorted = [...result.value].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        setRelations(sorted);
      } else {
        setError(result.error.message);
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [accountId]);

  return useMemo(
    () => ({ relations, loading, error }),
    [relations, loading, error],
  );
}
