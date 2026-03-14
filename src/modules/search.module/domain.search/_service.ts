/**
 * Search domain service — pure business-rule functions for SearchIndexEntry management.
 *
 * search.module owns the cross-module search projection.  This service provides
 * the relevance scoring, visibility filtering, and tombstoning logic needed by
 * the application layer before delegating persistence to the infra adapter.
 *
 * All functions are stateless and side-effect-free.
 */

import type { SearchIndexEntry, SearchResult } from "./_entity";
import type { SearchIndexId, IndexEntryVisibility } from "./_value-objects";

// ---------------------------------------------------------------------------
// Visibility guard
// ---------------------------------------------------------------------------

/**
 * Returns `true` when `entry` may be returned to `accountId`.
 *
 * Rules:
 *   - `public`            → visible to everyone
 *   - `account-private`   → visible only to the ownerAccountId
 *   - `workspace-private` → visible to ownerAccountId OR any caller within the
 *                           same workspaceId
 */
export function isVisibleTo(
  entry: SearchIndexEntry,
  accountId: string,
  workspaceId?: string,
): boolean {
  if (entry.visibility === "public") return true;
  if (entry.ownerAccountId === accountId) return true;
  if (
    entry.visibility === "workspace-private" &&
    workspaceId !== undefined &&
    entry.workspaceId === workspaceId
  ) {
    return true;
  }
  return false;
}

/** Filters a list of entries to those visible to a caller. */
export function filterByVisibility(
  entries: SearchIndexEntry[],
  ownerAccountId: string,
  workspaceId?: string,
): SearchIndexEntry[] {
  return entries.filter((e) => isVisibleTo(e, ownerAccountId, workspaceId));
}

// ---------------------------------------------------------------------------
// Relevance scoring
// ---------------------------------------------------------------------------

/**
 * Computes a simple TF-style relevance score for `entry` against search terms.
 *
 * Title matches count 3×; snippet matches count 1×; tag matches count 2×.
 * The score is normalised by the number of terms to stay in a comparable range.
 */
export function scoreRelevance(
  entry: SearchIndexEntry,
  terms: string[],
): number {
  if (terms.length === 0) return 0;
  const titleLower = entry.title.toLowerCase();
  const snippetLower = entry.snippet.toLowerCase();
  const tagsLower = entry.tags.map((t) => t.toLowerCase());

  let score = 0;
  for (const term of terms) {
    const t = term.toLowerCase();
    if (titleLower.includes(t)) score += 3;
    if (snippetLower.includes(t)) score += 1;
    if (tagsLower.some((tag) => tag.includes(t))) score += 2;
  }
  return score / terms.length;
}

/**
 * Converts scored entries into SearchResult objects, sorted by score descending,
 * capped at `limit`.
 */
export function rankResults(
  entries: SearchIndexEntry[],
  queryText: string,
  limit = 20,
): SearchResult[] {
  const terms = queryText
    .trim()
    .split(/\s+/)
    .filter((t) => t.length > 0);

  return entries
    .map((e) => ({
      sourceModule: e.sourceModule,
      sourceId: e.sourceId,
      title: e.title,
      snippet: e.snippet,
      score: scoreRelevance(e, terms),
    }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// ---------------------------------------------------------------------------
// Tombstoning
// ---------------------------------------------------------------------------

/**
 * Returns a copy of `entry` marked as tombstoned (deleted source record).
 * Tombstoned entries are retained in the index but return no useful content.
 */
export function tombstoneEntry(entry: SearchIndexEntry): SearchIndexEntry {
  return {
    ...entry,
    title: "[deleted]",
    snippet: "[deleted]",
    tags: [],
    visibility: "account-private" as IndexEntryVisibility,
    indexedAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Builds a new SearchIndexEntry.  Tags default to `[]` and can be supplied
 * optionally.
 */
export function buildIndexEntry(
  id: SearchIndexId,
  sourceModule: string,
  sourceId: string,
  title: string,
  snippet: string,
  ownerAccountId: string,
  visibility: IndexEntryVisibility,
  now: string,
  tags: readonly string[] = [],
  workspaceId?: string,
): SearchIndexEntry {
  return {
    id,
    sourceModule,
    sourceId,
    ownerAccountId,
    workspaceId,
    visibility,
    title,
    snippet,
    tags,
    indexedAt: now,
  };
}
