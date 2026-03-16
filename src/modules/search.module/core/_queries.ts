import type { SearchScope } from "../domain.search/_value-objects";
import { FirestoreSearchQueryAdapter } from "../infra.firestore/_repository";
import { executeSearch as executeSearchUseCase, type SearchResultDTO } from "./_use-cases";

const searchQueryAdapter = new FirestoreSearchQueryAdapter();

export type { SearchResultDTO };

export async function executeSearch(
  q: string,
  ownerAccountId: string,
  scope: SearchScope,
  workspaceId?: string,
  limit = 20,
) {
  return executeSearchUseCase(searchQueryAdapter, q, ownerAccountId, scope, workspaceId, limit);
}
