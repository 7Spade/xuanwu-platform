/**
 * Fork domain service — pure business-rule functions for ForkEntity management.
 *
 * A Fork represents a versioned snapshot of a workspace that can diverge
 * independently and be merged back into the origin via a Change Request (CR).
 *
 * All functions are stateless and side-effect-free.
 */

import type { ForkEntity } from "./_entity";
import type { ForkStatus } from "./_value-objects";

// ---------------------------------------------------------------------------
// Fork FSM
// ---------------------------------------------------------------------------

/**
 * Valid status transitions for a Fork.
 *
 *   active    → abandoned  (fork discarded by owner)
 *   active    → merged     (merge-back CR accepted without intermediate state)
 */
export const VALID_FORK_TRANSITIONS: Readonly<Record<ForkStatus, ForkStatus[]>> = {
  active: ["merged", "abandoned"],
  merged: [],
  abandoned: [],
};

/**
 * Returns `true` when the fork may transition from `current` status to `next`.
 */
export function canTransitionForkStatus(
  current: ForkStatus,
  next: ForkStatus,
): boolean {
  return (VALID_FORK_TRANSITIONS[current] ?? []).includes(next);
}

// ---------------------------------------------------------------------------
// Eligibility guards
// ---------------------------------------------------------------------------

/** Returns `true` when the fork has an open Change Request pending review. */
export function hasPendingCR(fork: ForkEntity): boolean {
  return !!fork.pendingCRId;
}

/**
 * Returns `true` when the fork may initiate a merge-back.
 * Condition: status must be `active`.
 */
export function isMergeBackEligible(fork: ForkEntity): boolean {
  return fork.status === "active";
}

/** Returns `true` when the fork is in a terminal state (merged or abandoned). */
export function isForkClosed(fork: ForkEntity): boolean {
  return fork.status === "merged" || fork.status === "abandoned";
}

// ---------------------------------------------------------------------------
// Divergence helpers
// ---------------------------------------------------------------------------

/**
 * Counts items that appear in the `forkedItems` set but not in `originItems`.
 * Used to quantify the divergence (number of additions) before a merge-back.
 */
export function computeDivergenceCount(
  forkedItems: readonly string[],
  originItems: readonly string[],
): number {
  const originSet = new Set(originItems);
  return forkedItems.filter((id) => !originSet.has(id)).length;
}

/**
 * Builds a human-readable divergence summary string.
 * Example: "+3 added, ~1 modified, -2 removed"
 */
export function buildDivergenceSummary(
  added: number,
  modified: number,
  removed: number,
): string {
  const parts: string[] = [];
  if (added > 0) parts.push(`+${added} added`);
  if (modified > 0) parts.push(`~${modified} modified`);
  if (removed > 0) parts.push(`-${removed} removed`);
  return parts.length > 0 ? parts.join(", ") : "no changes";
}
