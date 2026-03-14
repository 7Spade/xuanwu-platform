import type { SearchIndexId, IndexEntryVisibility } from "./_value-objects";

/**
 * SearchIndexEntry — a materialized projection of cross-module content.
 * Invariants:
 *   - Uniquely keyed by (sourceModule, sourceId).
 *   - Owned by search.module; source of truth is in the originating module.
 *   - Stale/deleted source records result in tombstoning.
 */
export interface SearchIndexEntry {
  readonly id: SearchIndexId;
  readonly sourceModule: string;
  readonly sourceId: string;
  readonly ownerAccountId: string;
  readonly workspaceId?: string;
  readonly visibility: IndexEntryVisibility;
  readonly title: string;
  readonly snippet: string;
  readonly tags: readonly string[];
  readonly indexedAt: string; // ISO-8601
}

/** A single search result. */
export interface SearchResult {
  readonly sourceModule: string;
  readonly sourceId: string;
  readonly title: string;
  readonly snippet: string;
  readonly score: number;
}

export function buildSearchIndexEntry(
  id: SearchIndexId,
  sourceModule: string,
  sourceId: string,
  ownerAccountId: string,
  title: string,
  snippet: string,
  visibility: IndexEntryVisibility,
  now: string,
): SearchIndexEntry {
  return {
    id, sourceModule, sourceId, ownerAccountId,
    title, snippet, tags: [], visibility, indexedAt: now,
  };
}
