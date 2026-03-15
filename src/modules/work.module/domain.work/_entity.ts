import type { WorkItemId, MilestoneId, WorkItemStatus, WorkItemPriority, DependencyType } from "./_value-objects";

/** A dependency link between two WorkItems. */
export interface WorkDependency {
  readonly sourceId: WorkItemId;
  readonly targetId: WorkItemId;
  readonly type: DependencyType;
}

/** Physical location tag for a task (building/floor/room). */
export interface TaskLocation {
  readonly building?: string;
  readonly floor?: string;
  readonly room?: string;
  readonly description?: string;
}

/**
 * WorkItem aggregate root.
 * Invariants:
 *   - A Dependency must not create a cycle.
 *   - WorkItems can be promoted to WBS Tasks by attaching structured records.
 */
export interface WorkItemEntity {
  readonly id: WorkItemId;
  readonly workspaceId: string;
  readonly title: string;
  readonly description?: string;
  readonly status: WorkItemStatus;
  readonly priority: WorkItemPriority;
  readonly milestoneId?: MilestoneId;
  readonly assigneeId?: string;
  readonly dueDate?: string; // ISO-8601
  readonly dependencies: readonly WorkDependency[];
  readonly createdAt: string;
  readonly updatedAt: string;
  // --- Wave 43: WBS Tree Engine extensions ---
  readonly parentId?: WorkItemId;
  readonly type?: string;
  readonly quantity?: number;
  readonly unitPrice?: number;
  readonly discount?: number;
  /** Auto-computed: quantity × unitPrice − discount. Stored for fast reads. */
  readonly subtotal?: number;
  readonly completedQuantity?: number;
  readonly location?: TaskLocation;
  readonly photoURLs?: readonly string[];
  readonly sourceIntentIndex?: number;
}

/** Milestone — groups WorkItems under a target date. */
export interface MilestoneEntity {
  readonly id: MilestoneId;
  readonly workspaceId: string;
  readonly name: string;
  readonly targetDate: string; // ISO-8601
  readonly workItemIds: readonly WorkItemId[];
  readonly createdAt: string;
}

export function buildWorkItem(
  id: WorkItemId,
  workspaceId: string,
  title: string,
  priority: WorkItemPriority,
  now: string,
): WorkItemEntity {
  return {
    id, workspaceId, title, priority,
    status: "open", dependencies: [],
    createdAt: now, updatedAt: now,
  };
}
