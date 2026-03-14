// SearchIndex aggregate — a materialized, searchable projection of cross-module content
//
// Invariants:
//   - Each SearchIndexEntry is uniquely keyed by (sourceModule, sourceId).
//   - Index entries are owned by search.module; the source of truth is in the originating module.
//   - Stale or deleted source records must result in index entry removal or tombstoning.
//   - Access control metadata (ownerAccountId, visibility) is embedded for query-time filtering.
