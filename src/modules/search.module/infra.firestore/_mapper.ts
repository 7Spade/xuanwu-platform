/**
 * Search mapper — Firestore document ↔ SearchIndexEntry transformation.
 *
 * Keeps all Firestore-specific field names and null-coercions in one place,
 * so the domain layer never has to know about Firestore's wire format.
 */

import type { SearchIndexEntry } from "../domain.search/_entity";
import type {
  SearchIndexId,
  IndexEntryVisibility,
} from "../domain.search/_value-objects";

// ---------------------------------------------------------------------------
// Firestore document shape (raw, unvalidated)
// ---------------------------------------------------------------------------

/** Raw Firestore document shape for a SearchIndexEntry. */
export interface SearchIndexEntryDoc {
  id: string;
  sourceModule: string;
  sourceId: string;
  ownerAccountId: string;
  workspaceId: string | null;
  visibility: string;
  title: string;
  snippet: string;
  tags: string[];
  indexedAt: string;
}

// ---------------------------------------------------------------------------
// Converters
// ---------------------------------------------------------------------------

export function searchEntryDocToEntity(
  doc: SearchIndexEntryDoc,
): SearchIndexEntry {
  return {
    id: doc.id as SearchIndexId,
    sourceModule: doc.sourceModule,
    sourceId: doc.sourceId,
    ownerAccountId: doc.ownerAccountId,
    workspaceId: doc.workspaceId ?? undefined,
    visibility: doc.visibility as IndexEntryVisibility,
    title: doc.title,
    snippet: doc.snippet,
    tags: doc.tags,
    indexedAt: doc.indexedAt,
  };
}

export function searchEntryToDoc(
  entry: SearchIndexEntry,
): SearchIndexEntryDoc {
  return {
    id: entry.id,
    sourceModule: entry.sourceModule,
    sourceId: entry.sourceId,
    ownerAccountId: entry.ownerAccountId,
    workspaceId: entry.workspaceId ?? null,
    visibility: entry.visibility,
    title: entry.title,
    snippet: entry.snippet,
    tags: [...entry.tags],
    indexedAt: entry.indexedAt,
  };
}
