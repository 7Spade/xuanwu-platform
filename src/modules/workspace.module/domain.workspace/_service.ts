/**
 * Workspace domain services — pure business-rule functions spanning the Workspace aggregate.
 *
 * All functions are synchronous, side-effect free, and infrastructure-independent.
 * No async I/O or framework imports are permitted in this file.
 *
 * Adapted from 7Spade/xuanwu workspace.slice/_workspace.rules.ts and _task.rules.ts.
 */

import type { WorkspaceEntity, WorkspaceTask } from "./_entity";
import { hasWorkspaceAccess } from "./_entity";

// ---------------------------------------------------------------------------
// WorkspaceVisibilityService
// ---------------------------------------------------------------------------

/**
 * Returns true if the workspace should be visible to the given user,
 * taking the workspace's visibility setting and the user's grants / team
 * memberships into account.
 */
export function isWorkspaceVisibleToUser(
  workspace: WorkspaceEntity,
  userId: string,
  userTeamIds: ReadonlySet<string>,
): boolean {
  if (workspace.visibility === "visible") return true;
  if (workspace.visibility === "hidden") {
    return hasWorkspaceAccess(workspace, userId, userTeamIds);
  }
  return false;
}

/**
 * Returns the subset of workspaces that are visible to the given user.
 *
 * Business rules:
 *   - Personal accounts: user sees all workspaces in their dimension.
 *   - Organization accounts: org owners see everything; regular members see
 *     workspaces where visibility='visible' OR they have an explicit grant /
 *     team membership.
 *
 * @param workspaces   All workspaces to filter
 * @param userId       The acting user
 * @param dimensionId  The account that owns the workspaces
 * @param isOwnerOfDimension  Whether the user is the dimension owner
 * @param accountType  "user" | "organization"
 * @param userTeamIds  Set of team IDs the user belongs to (org context)
 */
export function filterVisibleWorkspaces(
  workspaces: WorkspaceEntity[],
  userId: string,
  dimensionId: string,
  isOwnerOfDimension: boolean,
  accountType: "user" | "organization",
  userTeamIds: ReadonlySet<string>,
): WorkspaceEntity[] {
  const dimensionWorkspaces = workspaces.filter(
    (ws) => ws.dimensionId === dimensionId,
  );

  if (accountType === "user") {
    // Personal accounts: the owner sees all their own workspaces
    return dimensionWorkspaces;
  }

  if (accountType === "organization") {
    // Org owners see everything in their org
    if (isOwnerOfDimension) return dimensionWorkspaces;

    // Regular members: apply visibility + access rules
    return dimensionWorkspaces.filter((ws) =>
      isWorkspaceVisibleToUser(ws, userId, userTeamIds),
    );
  }

  return [];
}

// ---------------------------------------------------------------------------
// TaskWithChildren — extended WBS task type for tree operations
// ---------------------------------------------------------------------------

/** A WorkspaceTask enriched with computed WBS metadata for tree operations. */
export interface TaskWithChildren extends WorkspaceTask {
  /** Child tasks in tree order. */
  children: TaskWithChildren[];
  /** Sum of `subtotal` for all descendant tasks. */
  descendantSum: number;
  /** WBS numbering string (e.g. "1.2.3"). */
  wbsNo: string;
  /** Computed progress percentage 0–100. */
  progress: number;
}

// ---------------------------------------------------------------------------
// TaskBlockingService — WBS tree builder
// ---------------------------------------------------------------------------

/** A task is considered "divisible" (quantity-based) when its quantity exceeds this threshold. */
const MULTI_QUANTITY_THRESHOLD = 1;
/** Default quantity for tasks that do not explicitly set one. */
const DEFAULT_QUANTITY = 1;
/** Progress percentage representing full completion. */
const FULL_PROGRESS = 100;
/** Terminal states that count as completed for atomic (non-divisible) tasks. */
const COMPLETED_STATES: WorkspaceTask["progressState"][] = [
  "completed",
  "verified",
  "accepted",
];

/**
 * Builds a recursive WBS task tree from a flat list of WorkspaceTask records.
 *
 * Computes for each node:
 *   - `wbsNo` — hierarchical numbering (e.g. "1", "1.1", "1.1.2")
 *   - `descendantSum` — subtotal sum of all descendant tasks
 *   - `progress` — weighted-average progress 0–100 (leaf: by quantity or state)
 *   - `children` — ordered child nodes
 *
 * Circular dependencies are detected via a visited-path set and logged as errors.
 * Cyclic nodes are skipped to prevent infinite recursion.
 *
 * @param tasks Flat list of WorkspaceTask (typically from WorkspaceEntity.tasks).
 */
export function buildTaskTree(tasks: WorkspaceTask[]): TaskWithChildren[] {
  if (!tasks || tasks.length === 0) return [];

  const map: Record<string, TaskWithChildren> = {};
  tasks.forEach((t) => {
    map[t.id] = {
      ...t,
      children: [],
      descendantSum: 0,
      wbsNo: "",
      progress: 0,
    };
  });

  const roots: TaskWithChildren[] = [];

  const build = (
    node: TaskWithChildren,
    parentNo: string,
    index: number,
    path: ReadonlySet<string>,
  ): number => {
    if (path.has(node.id)) {
      console.error(
        `[workspace:buildTaskTree] Circular dependency detected: node "${node.id}" already in path [${[...path].join(" → ")}]`,
      );
      return 0;
    }
    const newPath = new Set(path);
    newPath.add(node.id);

    node.wbsNo = parentNo ? `${parentNo}.${index + 1}` : `${index + 1}`;

    let sum = 0;
    const children = tasks.filter((t) => t.parentId === node.id);
    children.forEach((child, i) => {
      const childNode = map[child.id];
      if (childNode) {
        sum += (childNode.subtotal ?? 0) + build(childNode, node.wbsNo, i, newPath);
        node.children.push(childNode);
      }
    });
    node.descendantSum = sum;

    if (node.children.length === 0) {
      // Leaf node — progress by quantity or terminal state
      if ((node.quantity ?? DEFAULT_QUANTITY) > MULTI_QUANTITY_THRESHOLD) {
        const completed = node.completedQuantity ?? 0;
        const total = node.quantity!;
        node.progress =
          total > 0 ? Math.round((completed / total) * FULL_PROGRESS) : 0;
      } else {
        node.progress = COMPLETED_STATES.includes(node.progressState)
          ? FULL_PROGRESS
          : 0;
      }
    } else {
      // Internal node — weighted average of children by subtotal
      const weightedSum = node.children.reduce(
        (acc, child) => acc + (child.progress ?? 0) * (child.subtotal ?? 0),
        0,
      );
      const totalSubtotal = node.children.reduce(
        (acc, child) => acc + (child.subtotal ?? 0),
        0,
      );

      if (totalSubtotal > 0) {
        node.progress = Math.round(weightedSum / totalSubtotal);
      } else {
        const allComplete = node.children.every(
          (c) => c.progress === FULL_PROGRESS,
        );
        node.progress = allComplete ? FULL_PROGRESS : 0;
      }
    }

    return sum;
  };

  tasks
    .filter((t) => !t.parentId)
    .forEach((root, i) => {
      const rootNode = map[root.id];
      if (rootNode) {
        build(rootNode, "", i, new Set<string>());
        roots.push(rootNode);
      }
    });

  return roots;
}
