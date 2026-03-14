/**
 * Audit domain service — pure business-rule functions for AuditEntry management.
 *
 * All functions are stateless and side-effect-free; they compute results from
 * domain objects already loaded into memory.  The append-only invariant of
 * AuditEntry is enforced by the infrastructure layer (no update/delete).
 */

import type { AuditEntry } from "./_entity";
import type { AuditAction } from "./_value-objects";

// ---------------------------------------------------------------------------
// Auditable actions
// ---------------------------------------------------------------------------

/**
 * Complete set of AuditAction values that must be recorded.
 * Derived from the AuditActionSchema enum in _value-objects.ts.
 */
export const AUDITABLE_ACTIONS: ReadonlySet<string> = new Set<AuditAction>([
  "created",
  "updated",
  "deleted",
  "approved",
  "rejected",
  "submitted",
  "signed-in",
  "signed-out",
  "access-granted",
  "access-revoked",
  "role-changed",
  "policy-changed",
]);

/**
 * Type guard — returns `true` when `action` is a recognised AuditAction.
 */
export function isActionAuditable(action: string): action is AuditAction {
  return AUDITABLE_ACTIONS.has(action);
}

// ---------------------------------------------------------------------------
// Filter helpers
// ---------------------------------------------------------------------------

/** Returns entries that acted on a specific resource (optionally narrowed by id). */
export function filterByResource(
  entries: AuditEntry[],
  resourceType: string,
  resourceId?: string,
): AuditEntry[] {
  return entries.filter(
    (e) =>
      e.resource.resourceType === resourceType &&
      (resourceId === undefined || e.resource.resourceId === resourceId),
  );
}

/** Returns entries performed by a specific actor account. */
export function filterByActor(
  entries: AuditEntry[],
  actorAccountId: string,
): AuditEntry[] {
  return entries.filter((e) => e.actor.accountId === actorAccountId);
}

/** Returns entries within a specific workspace. */
export function filterByWorkspace(
  entries: AuditEntry[],
  workspaceId: string,
): AuditEntry[] {
  return entries.filter((e) => e.resource.workspaceId === workspaceId);
}

// ---------------------------------------------------------------------------
// Grouping helpers
// ---------------------------------------------------------------------------

/** Groups entries by their action type. */
export function groupByAction(
  entries: AuditEntry[],
): Partial<Record<AuditAction, AuditEntry[]>> {
  const result: Partial<Record<AuditAction, AuditEntry[]>> = {};
  for (const entry of entries) {
    const bucket = result[entry.action] ?? [];
    bucket.push(entry);
    result[entry.action] = bucket;
  }
  return result;
}

/** Groups entries by the resource type they acted on. */
export function groupByResourceType(
  entries: AuditEntry[],
): Record<string, AuditEntry[]> {
  const result: Record<string, AuditEntry[]> = {};
  for (const entry of entries) {
    const key = entry.resource.resourceType;
    const bucket = result[key] ?? [];
    bucket.push(entry);
    result[key] = bucket;
  }
  return result;
}

// ---------------------------------------------------------------------------
// Aggregation helpers
// ---------------------------------------------------------------------------

/**
 * Computes the fraction of entries that satisfy `predicate` (e.g. a policy
 * pass rule).  Returns a value in [0, 1].  Returns 1 when entries is empty.
 */
export function computeComplianceRate(
  entries: AuditEntry[],
  predicate: (e: AuditEntry) => boolean,
): number {
  if (entries.length === 0) return 1;
  const passing = entries.filter(predicate).length;
  return passing / entries.length;
}

/** Returns a count of entries per resource type. */
export function summarizeByResourceType(
  entries: AuditEntry[],
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const entry of entries) {
    const key = entry.resource.resourceType;
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

// ---------------------------------------------------------------------------
// Sorting helper
// ---------------------------------------------------------------------------

/** Sorts entries by `occurredAt` timestamp.  Defaults to descending (newest first). */
export function sortByOccurredAt(
  entries: AuditEntry[],
  order: "asc" | "desc" = "desc",
): AuditEntry[] {
  return [...entries].sort((a, b) => {
    const cmp = a.occurredAt.localeCompare(b.occurredAt);
    return order === "asc" ? cmp : -cmp;
  });
}
