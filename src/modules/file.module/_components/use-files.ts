"use client";
/**
 * useFiles — fetches workspace files from file.module query facade.
 *
 * Presentation code stays adapter-agnostic and only calls the application
 * query entrypoint exposed by the module.
 */

import { useState, useEffect } from "react";
import { getFilesByWorkspace, type FileDTO } from "../core/_queries";

export interface UseFilesResult {
  files: FileDTO[];
  loading: boolean;
  error: string | null;
}

export function useFiles(workspaceId: string | null | undefined): UseFilesResult {
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
    getFilesByWorkspace(workspaceId).then((result) => {
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
  }, [workspaceId]);

  return { files, loading, error };
}
