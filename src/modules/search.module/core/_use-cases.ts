import { ok, fail } from "@/shared";
import type { Result } from "@/shared";
import { buildSearchIndexEntry } from "../domain.search/_entity";
import type { SearchIndexId, SearchScope, IndexEntryVisibility } from "../domain.search/_value-objects";
import type { ISearchIndexRepository, ISearchQueryPort } from "../domain.search/_ports";

export interface SearchResultDTO {
  readonly sourceModule: string;
  readonly sourceId: string;
  readonly title: string;
  readonly snippet: string;
  readonly score: number;
}

export async function indexDocument(
  repo: ISearchIndexRepository,
  id: string,
  sourceModule: string,
  sourceId: string,
  ownerAccountId: string,
  title: string,
  snippet: string,
  visibility: IndexEntryVisibility,
): Promise<Result<void>> {
  try {
    const now = new Date().toISOString();
    const entry = buildSearchIndexEntry(
      id as SearchIndexId, sourceModule, sourceId,
      ownerAccountId, title, snippet, visibility, now,
    );
    await repo.upsert(entry);
    return ok(undefined);
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

export async function executeSearch(
  queryPort: ISearchQueryPort,
  q: string,
  ownerAccountId: string,
  scope: SearchScope,
  workspaceId?: string,
  limit = 20,
): Promise<Result<SearchResultDTO[]>> {
  try {
    const results = await queryPort.query(q, ownerAccountId, scope, workspaceId, limit);
    return ok(results.map((r) => ({ ...r })));
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}
