// work.module — Public API barrel
// Bounded Context: Work Items · Milestones · Dependencies / 工作項目 · 里程碑 · 依賴
// Layer: Workspace (SaaS Extensions)
//
// Work Items and Milestones are lightweight planning primitives distinct from structured
// WBS Tasks. They are created by users directly and can be attached to WBS for integration:
//   Work->>WBS: attach WBS structured records
//
// Re-export DTOs, actions, and queries as they are implemented.
// NEVER export entities, value objects, repositories, or domain events.
export {};
