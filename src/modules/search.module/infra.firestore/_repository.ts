/**
 * Search Firestore repository — implements ISearchIndexRepository and ISearchQueryPort.
 *
 * All Firestore access is isolated to this file.  The domain service handles
 * relevance scoring in-memory; this adapter handles persistence and basic
 * keyword pre-filtering via Firestore queries.
 *
 * Storage layout:
 *   search-index/{entryId}   — flat collection
 *   Composite index required: (ownerAccountId, visibility, indexedAt)
 *
 * Note: For production deployments replace FirestoreSearchQueryAdapter with an
 * Algolia / Typesense adapter behind the same ISearchQueryPort interface.
 */

import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
} from "firebase/firestore";
import type {
  ISearchIndexRepository,
  ISearchQueryPort,
} from "../domain.search/_ports";
import type { SearchIndexEntry, SearchResult } from "../domain.search/_entity";
import type { SearchScope } from "../domain.search/_value-objects";
import {
  filterByVisibility,
  rankResults,
} from "../domain.search/_service";
import {
  searchEntryDocToEntity,
  searchEntryToDoc,
  type SearchIndexEntryDoc,
} from "./_mapper";

const SEARCH_INDEX_COLLECTION = "search-index";
const DEFAULT_QUERY_LIMIT = 50;

// ---------------------------------------------------------------------------
// FirestoreSearchIndexRepository
// ---------------------------------------------------------------------------

export class FirestoreSearchIndexRepository implements ISearchIndexRepository {
  private get db() {
    return getFirestore();
  }

  async upsert(entry: SearchIndexEntry): Promise<void> {
    const ref = doc(this.db, SEARCH_INDEX_COLLECTION, entry.id);
    await setDoc(ref, searchEntryToDoc(entry));
  }

  async deleteBySourceRef(
    sourceModule: string,
    sourceId: string,
  ): Promise<void> {
    const col = collection(this.db, SEARCH_INDEX_COLLECTION);
    const q = query(
      col,
      where("sourceModule", "==", sourceModule),
      where("sourceId", "==", sourceId),
    );
    const snaps = await getDocs(q);
    await Promise.all(snaps.docs.map((d) => deleteDoc(d.ref)));
  }

  async findBySourceRef(
    sourceModule: string,
    sourceId: string,
  ): Promise<SearchIndexEntry | null> {
    const col = collection(this.db, SEARCH_INDEX_COLLECTION);
    const q = query(
      col,
      where("sourceModule", "==", sourceModule),
      where("sourceId", "==", sourceId),
      firestoreLimit(1),
    );
    const snaps = await getDocs(q);
    if (snaps.empty) return null;
    return searchEntryDocToEntity(snaps.docs[0]!.data() as SearchIndexEntryDoc);
  }
}

// ---------------------------------------------------------------------------
// FirestoreSearchQueryAdapter
// ---------------------------------------------------------------------------

/**
 * Firestore-backed fallback implementation of ISearchQueryPort.
 *
 * Fetches candidate entries owned by or visible to `ownerAccountId`, then
 * applies the in-memory domain service `rankResults` for relevance scoring.
 * Suitable for small datasets; replace with a dedicated search engine for
 * production scale.
 */
export class FirestoreSearchQueryAdapter implements ISearchQueryPort {
  private get db() {
    return getFirestore();
  }

  async query(
    q: string,
    ownerAccountId: string,
    scope: SearchScope,
    workspaceId?: string,
    maxResults = DEFAULT_QUERY_LIMIT,
  ): Promise<SearchResult[]> {
    const col = collection(this.db, SEARCH_INDEX_COLLECTION);

    // Pull a broad candidate set: public entries + caller-owned entries
    const publicQuery = query(
      col,
      where("visibility", "==", "public"),
      orderBy("indexedAt", "desc"),
      firestoreLimit(maxResults * 2),
    );
    const ownedQuery = query(
      col,
      where("ownerAccountId", "==", ownerAccountId),
      orderBy("indexedAt", "desc"),
      firestoreLimit(maxResults * 2),
    );

    const [publicSnaps, ownedSnaps] = await Promise.all([
      getDocs(publicQuery),
      getDocs(ownedQuery),
    ]);

    const seen = new Set<string>();
    const candidates: SearchIndexEntry[] = [];
    for (const snap of [...publicSnaps.docs, ...ownedSnaps.docs]) {
      if (seen.has(snap.id)) continue;
      seen.add(snap.id);
      candidates.push(
        searchEntryDocToEntity(snap.data() as SearchIndexEntryDoc),
      );
    }

    const visible = filterByVisibility(candidates, ownerAccountId, workspaceId);
    return rankResults(visible, q, maxResults);
  }
}
