// AuditEntry aggregate root — an immutable record of a domain event affecting a resource
//
// Invariants:
//   - AuditEntries are append-only; they cannot be updated or deleted.
//   - Each entry captures: actorId, actorAccountHandle, action, resourceType, resourceId,
//     timestamp, metadata (diff snapshot where applicable).
//   - Entries reference the originating domain event id for traceability.
//
// PolicyRule sub-aggregate:
//   - PolicyRules are defined per workspace or account context.
//   - Policy evaluation is deterministic: same inputs always yield same pass/fail result.
//   - Policy violations are recorded as AuditEntries with outcome: blocked.
