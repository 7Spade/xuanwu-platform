"use client";
/**
 * useComments — fetches comments for a specific artifact from Firestore.
 *
 * Wave 55: presentation hook for collaboration.module.
 * Pattern: memoized FirestoreCommentRepository → getCommentsByArtifact.
 * Returns { comments, loading, error, refresh }.
 */

import { useState, useEffect, useMemo, useCallback } from "react";
import { FirestoreCommentRepository } from "../infra.firestore/_repository";
import { getCommentsByArtifact, type CommentDTO } from "../core/_use-cases";

export interface UseCommentsResult {
  comments: CommentDTO[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useComments(
  artifactType: string | null | undefined,
  artifactId: string | null | undefined,
): UseCommentsResult {
  const repo = useMemo(() => new FirestoreCommentRepository(), []);
  const [comments, setComments] = useState<CommentDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    if (!artifactType || !artifactId) {
      setComments([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    getCommentsByArtifact(repo, artifactType, artifactId).then((result) => {
      if (cancelled) return;
      if (result.ok) {
        setComments(result.value);
      } else {
        setError(result.error.message);
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [repo, artifactType, artifactId, tick]);

  return { comments, loading, error, refresh };
}
