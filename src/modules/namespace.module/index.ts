// namespace.module — Public API barrel
// Bounded Context: Namespace / 命名空間
// Layer: SaaS (shared — serves both Organization namespaces and personal User namespaces)
//
// Namespace is a path-resolution and workspace-binding service used by BOTH:
//   - Organizations: Org->>NS: register organization namespace
//   - Users:         User->>NS: register personal namespace
// Both paths ultimately bind workspaces under their respective namespace scope.
//
// Re-export DTOs, actions, and queries as they are implemented.
// NEVER export entities, value objects, repositories, or domain events.
export {};
