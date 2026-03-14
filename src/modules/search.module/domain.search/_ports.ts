// Search port interfaces — implemented by infrastructure adapters
// e.g. ISearchIndexRepository   — write-side: upsert and delete index entries
//      ISearchQueryPort         — read-side: execute full-text or vector search
//      ISearchEventSubscriber   — subscribes to domain events from source modules
