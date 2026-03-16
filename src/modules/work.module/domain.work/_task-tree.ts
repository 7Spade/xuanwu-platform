/**
 * Task tree builder — converts a flat WorkItemDTO list into a hierarchy with
 * auto-computed wbsNo labels and descendant budget roll-up.
 *
 * Algorithm:
 *   1. Build a parent→children adjacency map.
 *   2. Collect root items (no parentId or parentId not in set).
 *   3. Recursively assign wbsNo (e.g. "1", "1.2", "1.2.3").
 *   4. Compute descendantSum = sum of all descendant subtotals.
 */

import type { WorkItemDTO } from "./_dto";

export interface TaskWithChildren extends WorkItemDTO {
  wbsNo: string;
  children: TaskWithChildren[];
  /** Recursive subtotal of all descendant subtotals (excluding self). */
  descendantSum: number;
}

function buildChildren(
  parentId: string | undefined,
  allItems: WorkItemDTO[],
  childMap: Map<string | undefined, WorkItemDTO[]>,
  prefix: string,
): TaskWithChildren[] {
  const children = childMap.get(parentId) ?? [];
  return children.map((item, idx) => {
    const wbsNo = prefix ? `${prefix}.${idx + 1}` : `${idx + 1}`;
    const nestedChildren = buildChildren(item.id, allItems, childMap, wbsNo);
    const descendantSum = nestedChildren.reduce(
      (sum, c) => sum + (c.subtotal ?? 0) + c.descendantSum,
      0,
    );
    return { ...item, wbsNo, children: nestedChildren, descendantSum };
  });
}

/**
 * Builds the task tree from a flat list of WorkItemDTOs.
 * Returns root-level nodes with nested children.
 */
export function buildTaskTree(items: WorkItemDTO[]): TaskWithChildren[] {
  const allIds = new Set(items.map((i) => i.id));

  // Build parent→children map; items whose parentId is absent or points to a
  // non-existent item are treated as roots (orphan promotion to root behaviour).
  const childMap = new Map<string | undefined, WorkItemDTO[]>();
  for (const item of items) {
    const key = item.parentId && allIds.has(item.parentId) ? item.parentId : undefined;
    const bucket = childMap.get(key) ?? [];
    bucket.push(item);
    childMap.set(key, bucket);
  }

  // Sort each bucket by creation time for stable ordering
  for (const [, bucket] of childMap) {
    bucket.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  return buildChildren(undefined, items, childMap, "");
}
