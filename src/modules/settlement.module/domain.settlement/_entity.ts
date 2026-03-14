import type { SettlementId, FinanceLifecycleStage, SettlementRole } from "./_value-objects";

// ---------------------------------------------------------------------------
// ClaimLineItem
// ---------------------------------------------------------------------------

export interface ClaimLineItem {
  readonly itemId: string;
  readonly name: string;
  readonly quantity: number;
  readonly unitPrice: number;
  readonly lineAmount: number;
}

// ---------------------------------------------------------------------------
// SettlementRecord — aggregate root
// ---------------------------------------------------------------------------

/**
 * The Settlement aggregate root.
 * Tracks the finance lifecycle for a workspace's AR or AP obligation.
 *
 * Invariants:
 *   - Lifecycle stages move forward only (no backward transitions).
 *   - Total claimed amount must not exceed the contract value.
 *   - A settlement record is linked to exactly one workspace.
 */
export interface SettlementRecord {
  readonly id: SettlementId;
  readonly workspaceId: string;
  readonly dimensionId: string;
  readonly role: SettlementRole;
  readonly stage: FinanceLifecycleStage;
  /** Monotonic cycle counter (incremented when a new claim is submitted). */
  readonly cycleIndex: number;
  readonly contractAmount: number;
  readonly receivedAmount: number;
  readonly currentClaimLineItems: readonly ClaimLineItem[];
  /** ISO-8601 — set when stage enters payment-term. */
  readonly paymentTermStartAt: string | null;
  /** ISO-8601 — set when payment is received. */
  readonly paymentReceivedAt: string | null;
  readonly createdAt: string;  // ISO-8601
  readonly updatedAt: string;  // ISO-8601
}

// ---------------------------------------------------------------------------
// Factory helpers
// ---------------------------------------------------------------------------

export function buildSettlementRecord(
  id: SettlementId,
  workspaceId: string,
  dimensionId: string,
  role: SettlementRole,
  contractAmount: number,
  now: string,
): SettlementRecord {
  return {
    id,
    workspaceId,
    dimensionId,
    role,
    stage: "claim-preparation",
    cycleIndex: 0,
    contractAmount,
    receivedAmount: 0,
    currentClaimLineItems: [],
    paymentTermStartAt: null,
    paymentReceivedAt: null,
    createdAt: now,
    updatedAt: now,
  };
}
