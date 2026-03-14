// fork.module — Public API barrel
// Bounded Context: Fork Network / 分支網路
// Layer: Workspace (SaaS Extensions)
//
// A Fork is a planning-branch copy of a workspace baseline. Users can fork a workspace
// planning branch to propose changes, then submit a merge-back proposal via Change Request:
//   User->>Forks: fork a workspace planning branch
//   Forks->>CR: submit merge-back proposal
//
// Re-export DTOs, actions, and queries as they are implemented.
// NEVER export entities, value objects, repositories, or domain events.
export {};
