# ADR-011: WorkspaceGrant Expiry — Domain Invariant Enforcement

**Date**: 2026-03-16  
**Status**: Proposed  
**Source**: `docs/management/security-issues.md` — SEC-001

---

## Context

`WorkspaceEntity` holds a collection of `WorkspaceGrant` objects that control access to the workspace. Each grant has an optional `expiresAt?: string` field intended to support time-limited access (e.g. external contractors with a fixed engagement period).

However, the domain function that enforces access control does **not** check this field:

```typescript
// domain.workspace/_entity.ts (current)
export function hasDirectGrant(workspace: WorkspaceEntity, userId: string): boolean {
  return workspace.grants.some(
    (g) => g.userId === userId && g.status === "active",
    // ← expiresAt is never checked
  );
}
```

This is a **domain invariant violation** (MDHA §2.5): the system is in an invalid state where a grant that should be expired is still treated as active. Any temporary grant that reaches its `expiresAt` without a corresponding `status` update remains permanently valid.

The gap exists because:
1. There is no Domain Method or Domain Service that transitions `status` from `"active"` to `"expired"` when `expiresAt` is reached.
2. There is no background process or periodic check that enforces expiry.
3. Callers of `hasDirectGrant()` (and `hasWorkspaceAccess()`) never observe the `expiresAt` value.

**Security risk**: A contractor or collaborator given a time-limited grant can retain workspace access indefinitely after the grant's intended expiry unless the grant `status` is manually updated.

---

## Decision

### 1. Update `hasDirectGrant()` to enforce expiry at the domain level

```typescript
/**
 * Returns true if the user holds a currently active, non-expired direct grant.
 * @param now - ISO 8601 timestamp of the current instant (must be passed by caller
 *              to keep the domain layer pure and clock-injection-friendly).
 */
export function hasDirectGrant(
  workspace: WorkspaceEntity,
  userId: string,
  now: string,
): boolean {
  return workspace.grants.some(
    (g) =>
      g.userId === userId &&
      g.status === "active" &&
      (!g.expiresAt || g.expiresAt > now),
  );
}
```

Passing `now` as a parameter preserves domain-layer purity (no `Date.now()` side effect inside the domain) and makes the function deterministic and testable.

### 2. Update `hasWorkspaceAccess()` to thread `now` through

```typescript
export function hasWorkspaceAccess(
  workspace: WorkspaceEntity,
  userId: string,
  userTeamIds: string[],
  now: string,
): boolean {
  return hasDirectGrant(workspace, userId, now) || hasTeamGrant(workspace, userTeamIds);
}
```

### 3. Add `purgeExpiredGrants(workspace, now): WorkspaceEntity` domain function

```typescript
/**
 * Returns a new WorkspaceEntity with all expired grants moved to status "expired".
 * Call from the Application Layer during periodic cleanup or before persistence.
 */
export function purgeExpiredGrants(workspace: WorkspaceEntity, now: string): WorkspaceEntity {
  return {
    ...workspace,
    grants: workspace.grants.map((g) =>
      g.status === "active" && g.expiresAt && g.expiresAt <= now
        ? { ...g, status: "expired" as const }
        : g,
    ),
  };
}
```

The Application Layer may call `purgeExpiredGrants` before any workspace read that exposes grants, and persist the result if any grants were transitioned.

### 4. Update all call sites

All Application Layer code that calls `hasDirectGrant()` or `hasWorkspaceAccess()` must supply the current instant:

```typescript
// Application Layer use case example
const now = new Date().toISOString();
const allowed = hasWorkspaceAccess(workspace, userId, userTeamIds, now);
```

---

## Consequences

**Positive**:
- Closes a security invariant gap: temporary access grants now expire correctly even if `status` is never manually updated.
- Domain function is deterministic and testable (injectable `now`).
- `purgeExpiredGrants` enables idempotent cleanup without side effects.

**Negative / Trade-offs**:
- **Breaking change**: all callers of `hasDirectGrant()` and `hasWorkspaceAccess()` must be updated to pass `now`.
- Callers in the Application Layer and any Presentation hooks that invoke these domain functions need a `new Date().toISOString()` call.

**Context Mapping impact**:
- `workspace.module` (core producer): domain function signature changes.
- Any module that checks workspace access (e.g. server actions in `workspace.module/core/_actions.ts`) must pass `now`.

---

## Alternatives Considered

1. **Background cron job to update `status`**: Would catch expired grants eventually, but leaves a window where an expired grant is still active between cron runs. Rejected as the sole mechanism; may complement this ADR as an additional consistency sweep.
2. **Firestore Security Rules TTL**: Firebase does not support time-based Security Rules. Rejected.
3. **Leave `expiresAt` optional and document as best-effort**: Rejected. An optional field with defined business semantics that is never enforced is a domain invariant violation by definition.

---

## References

- MDHA §2.5 Invariants: `docs/architecture/notes/model-driven-hexagonal-architecture.md`
- MDHA §8.7 Authorization Boundary
- Source issue: `docs/management/security-issues.md` (SEC-001) — translated to this ADR and removed
