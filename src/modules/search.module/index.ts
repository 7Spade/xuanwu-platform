// search.module — Public API barrel
// Bounded Context: Search / 全域搜尋
// Layer: SaaS (cross-cutting — indexes and queries across multiple bounded contexts)
//
// Search provides a unified, full-text and semantic search surface across:
//   - Workspaces, Work Items, Issues, CRs (workspace.module, work.module)
//   - Files and document content (file.module)
//   - Accounts and Organization names (account.module)
//   - Comments and review threads (collaboration.module)
//
// Architecture notes:
//   - Search maintains a read-side index (projection / materialized view) kept in sync
//     via domain events published by the source modules.
//   - Query operations are read-only; the source of truth remains in each owning module.
//   - Index updates are eventual — triggered by events (e.g. WorkItemCreated, FileUploaded).
//
// Relationship to other modules:
//   - All source modules: publish domain events; search.module subscribes and updates index
//   - account.module: scope filtering (search within an Account's namespace)
//   - identity.module: authentication/authorization scope applied at query time
//
// Re-export DTOs, actions, and queries as they are implemented.
// NEVER export entities, value objects, repositories, or domain events.
export {};
