// Namespace domain services — logic spanning multiple namespace aggregates.

// NamespacePathResolutionService — given a WorkspacePath string ("ns-slug/ws-slug"),
//   resolves it to (NamespaceEntity, workspaceId) by looking up the namespace slug
//   and then finding the matching WorkspaceBinding.
//   Pure given inputs — delegates I/O to INamespaceRepository (caller responsibility).
//
// NamespaceConflictDetectionService — validates that a proposed slug is not reserved
//   (e.g. "api", "admin", "settings") and is not already taken by another namespace.
//   Invariant: reservedSlugs list is configuration, not domain state.
