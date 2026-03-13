// org.module — Public API barrel
// Bounded Context: Organization · Team · Identity
// Layer: SaaS
//
// Note: Namespace has been extracted to namespace.module — it is a separate bounded context
// shared by both organizations and personal users for workspace path resolution.
//
// Re-export DTOs, actions, and queries as they are implemented.
// NEVER export entities, value objects, repositories, or domain events.
export {};
