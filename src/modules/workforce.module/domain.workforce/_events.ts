import type { ScheduleId } from "./_value-objects";

interface WorkforceDomainEvent {
  readonly scheduleId: ScheduleId;
  readonly actorId: string;
  readonly occurredAt: string; // ISO-8601
}

export interface ScheduleProposalCreated extends WorkforceDomainEvent {
  readonly type: "workforce:schedule:proposal:created";
  readonly workspaceId: string;
  readonly assigneeIds: readonly string[];
  readonly startDate: string;
  readonly endDate: string;
}

export interface ScheduleApproved extends WorkforceDomainEvent {
  readonly type: "workforce:schedule:approved";
  readonly workspaceId: string;
}

export interface ScheduleRejected extends WorkforceDomainEvent {
  readonly type: "workforce:schedule:rejected";
  readonly reason?: string;
}

export interface ScheduleCompleted extends WorkforceDomainEvent {
  readonly type: "workforce:schedule:completed";
  readonly workspaceId: string;
}

export type WorkforceDomainEventUnion =
  | ScheduleProposalCreated
  | ScheduleApproved
  | ScheduleRejected
  | ScheduleCompleted;
