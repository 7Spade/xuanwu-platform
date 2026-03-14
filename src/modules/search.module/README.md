# search.module

**Bounded Context:** Search / 全域搜尋  
**Layer:** SaaS (cross-cutting)

## Purpose

`search.module` provides a unified full-text and semantic search surface across all bounded contexts.
It maintains a read-side index (projection) kept in sync via domain events from source modules.
Query operations are read-only; the source of truth remains in each owning module.

## What this module owns

| Concern | Description |
|---------|-------------|
| SearchIndex | Materialized, searchable projection of cross-module content |
| SearchQuery | Full-text + filter query execution with ranking |
| SearchSuggestion | Auto-complete / type-ahead suggestions |

## Cross-module dependencies

| Module | Direction | Reason |
|--------|-----------|--------|
| All source modules | ← | Subscribes to domain events to update the search index |
| `account.module` | → | Search scope filtering by account/namespace |
| `identity.module` | → | Auth scope applied at query time |

## Standard 4-layer structure

```
search.module/
├── index.ts
├── domain.search/
│   ├── _entity.ts               # SearchIndex (materialized projection)
│   ├── _value-objects.ts        # SearchQuery, SearchResultEntry, SearchScope
│   ├── _ports.ts                # ISearchIndexRepository, ISearchQueryPort, ISearchEventSubscriber
│   └── _events.ts               # SearchIndexUpdated
├── core/
│   ├── _use-cases.ts            # ExecuteSearchQueryUseCase, IndexSourceDocumentUseCase
│   ├── _actions.ts
│   └── _queries.ts
├── infra.firestore/
└── _components/
```
