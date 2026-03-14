# search.module — File Index

**Bounded Context**: 搜尋 / Search
**職責**: 全文搜尋索引建立與管理、跨模組內容可搜尋化、範圍化查詢（global/namespace/workspace）。
**不包含**: 內容生產（各業務模組負責）、向量搜尋（future infra 擴充）。

---

## `index.ts`
**描述**: 公開 API barrel — 匯出 DTOs、用例函數及 Port 介面。
**函數清單**:
- `export type SearchResultDTO` — 搜尋結果 DTO
- `export indexDocument` — 建立或更新搜尋索引條目
- `export executeSearch` — 執行全文搜尋查詢
- `export type ISearchIndexRepository` — 搜尋索引 Repository Port 介面
- `export type ISearchQueryPort` — 搜尋查詢執行 Port 介面

---

## `core/_use-cases.ts`
**描述**: 搜尋索引管理與查詢用例。
**函數清單**:
- `interface SearchResultDTO` — 搜尋結果 DTO（id, scope, resourceType, resourceId, title, snippet, relevanceScore）
- `indexDocument(repo, params): Promise<Result<void>>` — 建立/更新索引條目（upsert 語義）
- `executeSearch(queryPort, query, options): Promise<Result<SearchResultDTO[]>>` — 執行查詢（含 scope 過濾與分頁）

---

## `core/_actions.ts`
**描述**: `'use server'` 薄包裝層，重新匯出寫入型用例。
**函數清單**:
- 重新匯出 `SearchResultDTO`（型別）
- 重新匯出 `indexDocument`

---

## `core/_queries.ts`
**描述**: 伺服器端唯讀查詢重新匯出。
**函數清單**:
- 重新匯出 `SearchResultDTO`（型別）
- 重新匯出 `executeSearch`

---

## `domain.search/_value-objects.ts`
**描述**: 搜尋 domain 的 Branded Types 與輔助結構。
**函數清單**:
- `SearchIndexIdSchema` / `type SearchIndexId` — 索引條目唯一識別碼
- `SearchScopeSchema` / `type SearchScope` — 搜尋範圍 enum: `"global"|"namespace"|"workspace"`
- `IndexEntryVisibilitySchema` / `type IndexEntryVisibility` — 可見性 enum: `"public"|"account-private"|"workspace-member"`

---

## `domain.search/_entity.ts`
**描述**: `SearchIndexEntry` 索引條目與 `SearchResult` 結果結構。
**函數清單**:
- `interface SearchIndexEntry` — 搜尋索引條目（id, scope, resourceType, resourceId, title, contentSnippet, visibility, namespaceId, workspaceId, indexedAt）
- `interface SearchResult` — 搜尋結果（entry 欄位 + relevanceScore）
- `buildSearchIndexEntry(params, now): SearchIndexEntry` — 建立索引條目

---

## `domain.search/_events.ts`
**描述**: Search Bounded Context 的 Domain Event 型別定義。
**函數清單**: *(目前無對外 Domain Events，索引更新為內部操作)*

---

## `domain.search/_ports.ts`
**描述**: Search domain 的 Port 介面定義。
**函數清單**:
- `interface ISearchIndexRepository` — 索引持久化（upsert, findById, deleteByResource）
- `interface ISearchQueryPort` — 搜尋查詢執行抽象（search: 含 scope, query, pagination）

---

## `domain.search/_service.ts`
**描述**: Search domain service — 純函數，無 I/O。可見性過濾、TF 評分、結果排序、Tombstone 標記。
**函數清單**:
- `isVisibleTo(entry, accountId, workspaceId?): boolean` — 可見性守衛（public/account-private/workspace-private）
- `filterByVisibility(entries, ownerAccountId, workspaceId?): SearchIndexEntry[]`
- `scoreRelevance(entry, terms): number` — TF 評分（title×3, tags×2, snippet×1）
- `rankResults(entries, queryText, limit?): SearchResult[]` — 評分→降冪→截斷
- `tombstoneEntry(entry): SearchIndexEntry` — 回傳 title/snippet=[deleted] 的副本
- `buildIndexEntry(id, sourceModule, sourceId, title, snippet, ownerAccountId, visibility, now, tags?, workspaceId?): SearchIndexEntry` — Factory

---

## `infra.firestore/_mapper.ts`
**描述**: Firestore document ↔ SearchIndexEntry 雙向轉換。
**函數清單**:
- `interface SearchIndexEntryDoc` — Firestore 搜尋索引文件結構
- `searchEntryDocToEntity(doc): SearchIndexEntry`
- `searchEntryToDoc(entry): SearchIndexEntryDoc`

---

## `infra.firestore/_repository.ts`
**描述**: `ISearchIndexRepository` + `ISearchQueryPort` 的 Firestore 實作。集合 `search-index/{entryId}`。查詢時在記憶體中套用 `rankResults`；可替換為 Algolia 等搜尋引擎。
**函數清單**:
- `class FirestoreSearchIndexRepository implements ISearchIndexRepository`
  - `upsert(entry): Promise<void>`
  - `deleteBySourceRef(sourceModule, sourceId): Promise<void>`
  - `findBySourceRef(sourceModule, sourceId): Promise<SearchIndexEntry|null>` — limit(1)
- `class FirestoreSearchQueryAdapter implements ISearchQueryPort`
  - `query(q, ownerAccountId, scope, workspaceId?, limit?): Promise<SearchResult[]>` — 抓取候選記錄後套用 rankResults
