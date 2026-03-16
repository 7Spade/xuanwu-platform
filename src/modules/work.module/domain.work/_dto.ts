import type { WorkItemStatus, WorkItemPriority } from "./_value-objects";

/**
 * WorkItemDTO — read-only projection of a WorkItem aggregate used to carry
 * data across layer and module boundaries.
 *
 * Defined in the Domain layer so that domain helpers (e.g. task-tree builder)
 * can reference the shape without creating an upward dependency on the
 * Application layer.  The Application layer re-exports this type through
 * `core/_use-cases` for backwards compatibility.
 */
export interface WorkItemDTO {
  readonly id: string;
  readonly workspaceId: string;
  readonly title: string;
  readonly description?: string;
  readonly status: WorkItemStatus;
  readonly priority: WorkItemPriority;
  readonly assigneeId?: string;
  readonly dueDate?: string;
  readonly createdAt: string;
  // Wave 43 tree fields
  readonly parentId?: string;
  readonly type?: string;
  readonly quantity?: number;
  readonly unitPrice?: number;
  readonly discount?: number;
  readonly subtotal?: number;
  readonly completedQuantity?: number;
  readonly location?: { building?: string; floor?: string; room?: string; description?: string };
  readonly photoURLs?: readonly string[];
}
