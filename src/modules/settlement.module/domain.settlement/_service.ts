/**
 * Settlement domain services — logic spanning multiple settlement aggregates.
 *
 * Pure functions — no I/O, no async, no side-effects.
 *
 * SettlementCalculationService:
 *   - calculateSettlementSummary — aggregates total contract, received, and outstanding
 *     balances across a pre-loaded list of SettlementRecord aggregates.
 *   - computeOutstandingAmount — max(contractAmount - receivedAmount, 0).
 *   - isSettlementComplete — true when stage === "completed".
 *
 * FinanceLifecycleFSM:
 *   - VALID_STAGE_TRANSITIONS — forward-only state machine adjacency table.
 *   - canAdvanceStage — guards against invalid or backward stage transitions.
 *
 * ReconciliationService:
 *   - reconcilePayment — matches an incoming payment amount against the record's
 *     outstanding obligation within a configurable tolerance percentage.
 *     Returns a ReconciliationResult; never mutates the record directly.
 *   Invariant: stage advancement requires an explicit approval action; this fn is
 *   a read-only decision helper only.
 */

import type { SettlementRecord } from "./_entity";
import type { FinanceLifecycleStage } from "./_value-objects";

// ---------------------------------------------------------------------------
// SettlementSummary
// ---------------------------------------------------------------------------

/** Aggregated financial snapshot across a set of SettlementRecord aggregates. */
export interface SettlementSummary {
  readonly recordCount: number;
  readonly totalContractAmount: number;
  readonly totalReceivedAmount: number;
  /** max(totalContractAmount - totalReceivedAmount, 0) */
  readonly outstandingAmount: number;
}

// ---------------------------------------------------------------------------
// ReconciliationResult
// ---------------------------------------------------------------------------

export interface ReconciliationResult {
  /** True when the payment amount matches the outstanding obligation within tolerance. */
  readonly matched: boolean;
  /** Absolute difference between the payment amount and the outstanding amount. */
  readonly discrepancy: number;
  /** True when discrepancy exceeds the tolerance threshold and requires human review. */
  readonly requiresManualReview: boolean;
}

// ---------------------------------------------------------------------------
// FinanceLifecycleFSM — forward-only stage adjacency table
// ---------------------------------------------------------------------------

/**
 * Valid forward transitions for the FinanceLifecycleStage state machine.
 * Stages flow in one direction only; backward transitions are forbidden.
 */
export const VALID_STAGE_TRANSITIONS: Readonly<
  Record<FinanceLifecycleStage, FinanceLifecycleStage[]>
> = {
  "claim-preparation": ["claim-submitted"],
  "claim-submitted":   ["claim-approved"],
  "claim-approved":    ["invoice-requested"],
  "invoice-requested": ["payment-term"],
  "payment-term":      ["payment-received"],
  "payment-received":  ["completed"],
  "completed":         [],
};

// ---------------------------------------------------------------------------
// SettlementCalculationService
// ---------------------------------------------------------------------------

/**
 * Aggregates total contract, received, and outstanding amounts across a
 * pre-loaded list of SettlementRecord aggregates.
 *
 * Pure — callers must pre-load the records; this function performs no I/O.
 *
 * @param records  List of SettlementRecord aggregates to summarize.
 * @returns  SettlementSummary with totals and record count.
 */
export function calculateSettlementSummary(
  records: readonly SettlementRecord[],
): SettlementSummary {
  let totalContractAmount = 0;
  let totalReceivedAmount = 0;

  for (const r of records) {
    totalContractAmount += r.contractAmount;
    totalReceivedAmount += r.receivedAmount;
  }

  return {
    recordCount: records.length,
    totalContractAmount,
    totalReceivedAmount,
    outstandingAmount: Math.max(totalContractAmount - totalReceivedAmount, 0),
  };
}

/**
 * Returns true when the settlement record has reached the "completed" stage.
 *
 * @param record  The SettlementRecord aggregate to inspect.
 */
export function isSettlementComplete(record: SettlementRecord): boolean {
  return record.stage === "completed";
}

/**
 * Returns the outstanding financial obligation for a single record.
 * Clamped to 0; never negative.
 *
 * @param contractAmount  Total agreed contract value.
 * @param receivedAmount  Amount already received.
 */
export function computeOutstandingAmount(
  contractAmount: number,
  receivedAmount: number,
): number {
  return Math.max(contractAmount - receivedAmount, 0);
}

// ---------------------------------------------------------------------------
// FinanceLifecycleFSM
// ---------------------------------------------------------------------------

/**
 * Returns true if transitioning from `record.stage` to `nextStage` is a
 * valid forward move in the FinanceLifecycle state machine.
 *
 * @param record     The current SettlementRecord aggregate.
 * @param nextStage  Proposed target stage.
 */
export function canAdvanceStage(
  record: SettlementRecord,
  nextStage: FinanceLifecycleStage,
): boolean {
  const allowed = VALID_STAGE_TRANSITIONS[record.stage];
  return allowed.includes(nextStage);
}

// ---------------------------------------------------------------------------
// ReconciliationService
// ---------------------------------------------------------------------------

/**
 * Matches an incoming payment amount against the record's outstanding obligation
 * within a configurable tolerance percentage.
 *
 * This is a read-only decision helper — it never mutates the SettlementRecord.
 * Invariant: stage advancement requires an explicit approval action by the
 * application layer; this function only reports the reconciliation outcome.
 *
 * @param record        The SettlementRecord whose outstanding amount is checked.
 * @param paymentAmount Incoming payment to reconcile.
 * @param tolerancePct  Allowed tolerance as a fraction (e.g. 0.02 = 2%).
 *                      Defaults to 0.02.
 * @returns  ReconciliationResult with match status, discrepancy, and review flag.
 */
export function reconcilePayment(
  record: SettlementRecord,
  paymentAmount: number,
  tolerancePct = 0.02,
): ReconciliationResult {
  const outstanding = computeOutstandingAmount(
    record.contractAmount,
    record.receivedAmount,
  );
  const discrepancy = Math.abs(paymentAmount - outstanding);
  const toleranceAmount = outstanding * tolerancePct;
  const matched = discrepancy <= toleranceAmount;

  return {
    matched,
    discrepancy,
    requiresManualReview: !matched,
  };
}
