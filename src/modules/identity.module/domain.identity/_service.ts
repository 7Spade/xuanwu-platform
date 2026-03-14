// Identity domain services — logic spanning multiple identity aggregates.
// Domain services are kept minimal: most auth logic is a single-aggregate concern
// and belongs in use cases (application layer).

// ProviderMigrationService — migrate an anonymous identity to a permanent provider
//   without losing history or the linked accountId.
//   Invariant: after migration the providerUid changes; accountId must be preserved.
//
// SessionCleanupService — revoke stale or orphaned sessions in bulk.
//   Useful when an admin disables an account or during security incident response.
