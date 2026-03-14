// Search domain services.
// SearchIndexSyncService — propagates source-module change events to SearchIndexEntry records,
//   ensuring eventual consistency between source modules and the search index.
// SearchResultRankingService — applies relevance scoring and access-control filtering,
//   filtering results the caller is not authorized to see.
