/**
 * Work domain services.
 *
 * Pure functions — no I/O, no async, no side-effects.
 *
 * DependencyGraphValidationService:
 *   - detectDependencyCycle — guards against cycles in the WorkItem DAG before
 *     a new dependency edge is committed (DFS reachability check).
 *   - getBlockingItems — returns all WorkItem IDs that block a given item.
 *
 * MilestoneProgressCalculationService:
 *   - calculateMilestoneProgress — computes milestone completion % from the
 *     count of "closed" WorkItems out of the total assigned to the milestone.
 */

import type { WorkItemId } from "./_value-objects";
import type { WorkItemEntity } from "./_entity";

// ---------------------------------------------------------------------------
// DependencyGraphValidationService
// ---------------------------------------------------------------------------

/**
 * Detect whether adding a dependency from `newSourceId → newTargetId` would
 * introduce a cycle in the existing adjacency map.
 *
 * @param adjacency  Map from WorkItemId to the set of target IDs it currently
 *                   points to via a `depends-on` or `blocks` dependency.
 * @param newSourceId  The item that will depend on (or block) `newTargetId`.
 * @param newTargetId  The item that `newSourceId` will point to.
 * @returns `true` if the proposed edge would create a cycle, `false` otherwise.
 *
 * Pure — callers must pre-load the full adjacency map; this function performs
 * no I/O.
 */
export function detectDependencyCycle(
  adjacency: Map<WorkItemId, WorkItemId[]>,
  newSourceId: WorkItemId,
  newTargetId: WorkItemId,
): boolean {
  // Trivial self-loop
  if (newSourceId === newTargetId) return true;

  // DFS from newTargetId to check if newSourceId is already reachable
  const visited = new Set<WorkItemId>();
  const stack: WorkItemId[] = [newTargetId];

  while (stack.length > 0) {
    const current = stack.pop()!;
    if (current === newSourceId) return true;
    if (visited.has(current)) continue;
    visited.add(current);
    const neighbors = adjacency.get(current) ?? [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) stack.push(neighbor);
    }
  }

  return false;
}

/**
 * Return the IDs of all WorkItems that directly block the given `targetId`.
 *
 * A WorkItem A blocks B when A has a `WorkDependency` with `type === "blocks"`
 * and `targetId === B`.
 *
 * @param items  Pre-loaded flat list of all work items in a workspace.
 * @param blockedId  The ID of the item whose blockers are to be found.
 * @returns  Array of WorkItemIds that are currently blocking `blockedId`.
 */
export function getBlockingItems(
  items: readonly WorkItemEntity[],
  blockedId: WorkItemId,
): WorkItemId[] {
  const blockers: WorkItemId[] = [];
  for (const item of items) {
    for (const dep of item.dependencies) {
      if (dep.type === "blocks" && dep.targetId === blockedId) {
        blockers.push(item.id);
        break;
      }
    }
  }
  return blockers;
}

// ---------------------------------------------------------------------------
// MilestoneProgressCalculationService
// ---------------------------------------------------------------------------

/**
 * Compute milestone completion as a percentage (0–100).
 *
 * Counts the proportion of `closed` WorkItems among those supplied.
 * Callers should pre-filter the items list to those belonging to the milestone.
 *
 * @param items  WorkItemEntities assigned to the milestone.
 * @returns  Integer percentage 0–100.  Returns 0 for an empty list.
 */
export function calculateMilestoneProgress(
  items: readonly WorkItemEntity[],
): number {
  if (items.length === 0) return 0;
  const closedCount = items.filter((i) => i.status === "closed").length;
  return Math.round((closedCount / items.length) * 100);
}
