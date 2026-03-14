"use client";
/**
 * useFiles — fetches workspace files from Firestore.
 *
 * Pattern: memoized FirestoreFileRepository → getFilesByWorkspace use-case.
 * Returns { files, loading, error } — read-only; upload is a future write-side wave.
 */

import { useState, useEffect, useMemo } from "react";
import { FirestoreFileRepository } from "../infra.firestore/_repository";
import { getFilesByWorkspace, type FileDTO } from "../core/_use-cases";

export interface UseFilesResult {
  files: FileDTO[];
  loading: boolean;
  error: string | null;
}

export function useFiles(workspaceId: string | null | undefined): UseFilesResult {
  const repo = useMemo(() => new FirestoreFileRepository(), []);
  const [files, setFiles] = useState<FileDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!workspaceId) {
      setFiles([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    getFilesByWorkspace(repo, workspaceId).then((result) => {
      if (cancelled) return;
      if (result.ok) {
        setFiles(result.value);
      } else {
        setError(result.error.message);
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [repo, workspaceId]);

  return { files, loading, error };
}
