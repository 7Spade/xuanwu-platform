import type { ForkId, ForkStatus } from "./_value-objects";

/**
 * Fork aggregate root.
 * Invariants:
 *   - A fork is derived from a specific baseline version of a workspace.
 *   - Only one pending merge-back CR per fork is allowed at a time.
 */
export interface ForkEntity {
  readonly id: ForkId;
  readonly originWorkspaceId: string;
  readonly forkedByAccountId: string;
  readonly baselineVersion: string;
  readonly status: ForkStatus;
  readonly pendingCRId?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export function buildFork(
  id: ForkId, originWorkspaceId: string, forkedByAccountId: string,
  baselineVersion: string, now: string,
): ForkEntity {
  return {
    id, originWorkspaceId, forkedByAccountId, baselineVersion,
    status: "active", createdAt: now, updatedAt: now,
  };
}
