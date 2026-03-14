import type { SearchIndexEntry, SearchResult } from "./_entity";
import type { SearchScope } from "./_value-objects";

export interface ISearchIndexRepository {
  upsert(entry: SearchIndexEntry): Promise<void>;
  deleteBySourceRef(sourceModule: string, sourceId: string): Promise<void>;
  findBySourceRef(sourceModule: string, sourceId: string): Promise<SearchIndexEntry | null>;
}

export interface ISearchQueryPort {
  query(
    q: string,
    ownerAccountId: string,
    scope: SearchScope,
    workspaceId?: string,
    limit?: number,
  ): Promise<SearchResult[]>;
}
