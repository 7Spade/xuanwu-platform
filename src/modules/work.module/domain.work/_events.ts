import type { WorkItemId, WorkItemStatus } from "./_value-objects";

interface WorkDomainEvent { readonly workItemId: WorkItemId; readonly occurredAt: string; }

export interface WorkItemCreated extends WorkDomainEvent {
  readonly type: "work:item:created"; readonly workspaceId: string; readonly title: string;
}
export interface WorkItemStatusChanged extends WorkDomainEvent {
  readonly type: "work:item:status:changed";
  readonly previousStatus: WorkItemStatus; readonly newStatus: WorkItemStatus;
}
export type WorkDomainEventUnion = WorkItemCreated | WorkItemStatusChanged;
