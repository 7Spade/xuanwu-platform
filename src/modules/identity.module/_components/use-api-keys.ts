"use client";
/**
 * useApiKeys — fetches all API keys for a namespace slug from Firestore.
 *
 * Pattern: memoized FirestoreApiKeyRepository → getApiKeysBySlug use-case.
 * Returns { apiKeys, loading, error } — read-only; key generation is a
 * future write-side wave.
 */

import { useState, useEffect, useMemo } from "react";
import { FirestoreApiKeyRepository } from "../infra.firestore/_api-key-repository";
import { getApiKeysBySlug, type ApiKeyDTO } from "../core/_use-cases";

export interface UseApiKeysResult {
  apiKeys: ApiKeyDTO[];
  loading: boolean;
  error: string | null;
}

export function useApiKeys(namespaceSlug: string | null | undefined): UseApiKeysResult {
  const repo = useMemo(() => new FirestoreApiKeyRepository(), []);
  const [apiKeys, setApiKeys] = useState<ApiKeyDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!namespaceSlug) {
      setApiKeys([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    getApiKeysBySlug(repo, namespaceSlug).then((result) => {
      if (cancelled) return;
      if (result.ok) {
        setApiKeys(result.value);
      } else {
        setError(result.error.message);
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [repo, namespaceSlug]);

  return { apiKeys, loading, error };
}
