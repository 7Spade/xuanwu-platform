import type { WorkspaceId, WorkspaceRole, WorkspaceLifecycleState } from "./_value-objects";

// ---------------------------------------------------------------------------
// Base event shape
// ---------------------------------------------------------------------------

interface WorkspaceDomainEvent {
  readonly workspaceId: WorkspaceId;
  readonly actorId: string;
  readonly occurredAt: string; // ISO-8601
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

export interface WorkspaceCreated extends WorkspaceDomainEvent {
  readonly type: "workspace:created";
  readonly dimensionId: string;
  readonly name: string;
}

export interface WorkspaceLifecycleChanged extends WorkspaceDomainEvent {
  readonly type: "workspace:lifecycle:changed";
  readonly previousState: WorkspaceLifecycleState;
  readonly newState: WorkspaceLifecycleState;
}

export interface WorkspaceGranted extends WorkspaceDomainEvent {
  readonly type: "workspace:access:granted";
  readonly granteeId: string;
  readonly role: WorkspaceRole;
}

export interface WorkspaceGrantRevoked extends WorkspaceDomainEvent {
  readonly type: "workspace:access:revoked";
  readonly granteeId: string;
}

export interface TaskStateChanged extends WorkspaceDomainEvent {
  readonly type: "workspace:task:state:changed";
  readonly taskId: string;
  readonly previousState: string;
  readonly newState: string;
}

export interface TaskCreated extends WorkspaceDomainEvent {
  readonly type: "workspace:task:created";
  readonly taskId: string;
  readonly taskName: string;
  readonly parentId?: string;
}

/** Union of all workspace domain events. */
export type WorkspaceDomainEventUnion =
  | WorkspaceCreated
  | WorkspaceLifecycleChanged
  | WorkspaceGranted
  | WorkspaceGrantRevoked
  | TaskStateChanged
  | TaskCreated;
