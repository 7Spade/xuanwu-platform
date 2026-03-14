"use client";
/**
 * useMembers — client-side hook that fetches org members for a given slug.
 *
 * Source equivalent: workspace.slice/gov.members/_hooks/use-members.ts
 * Adapted: uses FirestoreAccountRepository (Web SDK) + getOrgMembersByHandle
 * use-case. Members are stored on the org AccountEntity.members[] array.
 *
 * Refreshes when slug changes or `refresh()` is called.
 */

import { useEffect, useMemo, useState } from "react";
import { FirestoreAccountRepository } from "@/modules/account.module/infra.firestore/_repository";
import {
  getOrgMembersByHandle,
  type MemberDTO,
} from "@/modules/account.module/core/_use-cases";

export interface UseMembersResult {
  members: MemberDTO[];
  loading: boolean;
  error: string | null;
  /** Re-fetch (e.g., after an invite or role update). */
  refresh: () => void;
}

/**
 * Fetches all membership records for the org identified by `slug` (handle).
 * Pass undefined/null to skip fetching until the slug is resolved.
 */
export function useMembers(
  slug: string | null | undefined,
): UseMembersResult {
  const [members, setMembers] = useState<MemberDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const repo = useMemo(() => new FirestoreAccountRepository(), []);

  useEffect(() => {
    if (!slug) {
      setMembers([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    getOrgMembersByHandle(repo, slug)
      .then((result) => {
        if (cancelled) return;
        if (result.ok) {
          setMembers(result.value);
        } else {
          setError(result.error?.message ?? "Failed to load members");
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

  return { members, loading, error, refresh };
}
