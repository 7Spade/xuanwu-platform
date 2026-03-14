import type { SettlementId, FinanceLifecycleStage } from "./_value-objects";

interface SettlementDomainEvent {
  readonly settlementId: SettlementId;
  readonly workspaceId: string;
  readonly occurredAt: string; // ISO-8601
}

export interface SettlementCreated extends SettlementDomainEvent {
  readonly type: "settlement:created";
  readonly contractAmount: number;
  readonly role: string;
}

export interface ClaimSubmitted extends SettlementDomainEvent {
  readonly type: "settlement:claim:submitted";
  readonly cycleIndex: number;
  readonly claimAmount: number;
}

export interface ClaimApproved extends SettlementDomainEvent {
  readonly type: "settlement:claim:approved";
  readonly cycleIndex: number;
}

export interface PaymentReceived extends SettlementDomainEvent {
  readonly type: "settlement:payment:received";
  readonly amount: number;
  readonly receivedAt: string;
}

export interface SettlementCompleted extends SettlementDomainEvent {
  readonly type: "settlement:completed";
  readonly totalReceived: number;
}

export type SettlementDomainEventUnion =
  | SettlementCreated
  | ClaimSubmitted
  | ClaimApproved
  | PaymentReceived
  | SettlementCompleted;
