// Search infrastructure — implements ISearchIndexRepository and ISearchQueryPort
// May delegate to an external search service (Algolia, Typesense, or Firestore full-text extension).
// Firestore is used as a fallback for basic keyword matching until a dedicated index is configured.
