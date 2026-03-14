import { describe, it, expect } from "vitest";
import {
  calculateSettlementSummary,
  canAdvanceStage,
  computeOutstandingAmount,
  isSettlementComplete,
  reconcilePayment,
  VALID_STAGE_TRANSITIONS,
} from "../_service";
import type { SettlementRecord } from "../_entity";
import type { FinanceLifecycleStage } from "../_value-objects";

function makeRecord(
  stage: FinanceLifecycleStage,
  contractAmount: number,
  receivedAmount: number,
): SettlementRecord {
  return {
    id: "sr-1",
    workspaceId: "ws-1",
    dimensionId: "dim-1",
    role: "accounts-payable",
    stage,
    cycleIndex: 0,
    contractAmount,
    receivedAmount,
    currentClaimLineItems: [],
    paymentTermStartAt: null,
    paymentReceivedAt: null,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  };
}

// ---------------------------------------------------------------------------
// computeOutstandingAmount
// ---------------------------------------------------------------------------

describe("computeOutstandingAmount", () => {
  it("returns the difference", () => {
    expect(computeOutstandingAmount(1000, 400)).toBe(600);
  });

  it("clamps to 0 when received exceeds contract", () => {
    expect(computeOutstandingAmount(500, 700)).toBe(0);
  });

  it("returns 0 when paid in full", () => {
    expect(computeOutstandingAmount(1000, 1000)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// isSettlementComplete
// ---------------------------------------------------------------------------

describe("isSettlementComplete", () => {
  it("returns true for completed stage", () => {
    expect(isSettlementComplete(makeRecord("completed", 100, 100))).toBe(true);
  });

  it("returns false for non-completed stage", () => {
    expect(isSettlementComplete(makeRecord("claim-preparation", 100, 0))).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// canAdvanceStage
// ---------------------------------------------------------------------------

describe("canAdvanceStage", () => {
  it("allows valid forward transition", () => {
    const record = makeRecord("claim-preparation", 100, 0);
    expect(canAdvanceStage(record, "claim-submitted")).toBe(true);
  });

  it("rejects backward transition", () => {
    const record = makeRecord("claim-submitted", 100, 0);
    expect(canAdvanceStage(record, "claim-preparation")).toBe(false);
  });

  it("rejects transition from completed stage", () => {
    const record = makeRecord("completed", 100, 100);
    expect(canAdvanceStage(record, "claim-preparation")).toBe(false);
  });

  it("each stage has a valid next stage (FSM coverage)", () => {
    const stages = Object.keys(VALID_STAGE_TRANSITIONS) as FinanceLifecycleStage[];
    for (const stage of stages) {
      const nexts = VALID_STAGE_TRANSITIONS[stage];
      if (nexts.length === 0) continue;
      const record = makeRecord(stage, 100, 0);
      expect(canAdvanceStage(record, nexts[0]!)).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// calculateSettlementSummary
// ---------------------------------------------------------------------------

describe("calculateSettlementSummary", () => {
  it("returns zeros for empty list", () => {
    const summary = calculateSettlementSummary([]);
    expect(summary.recordCount).toBe(0);
    expect(summary.totalContractAmount).toBe(0);
    expect(summary.outstandingAmount).toBe(0);
  });

  it("aggregates multiple records", () => {
    const records = [
      makeRecord("claim-preparation", 1000, 200),
      makeRecord("payment-received", 500, 500),
    ];
    const summary = calculateSettlementSummary(records);
    expect(summary.recordCount).toBe(2);
    expect(summary.totalContractAmount).toBe(1500);
    expect(summary.totalReceivedAmount).toBe(700);
    expect(summary.outstandingAmount).toBe(800);
  });

  it("clamps outstanding to 0 when overpaid", () => {
    const records = [makeRecord("payment-received", 100, 200)];
    const summary = calculateSettlementSummary(records);
    expect(summary.outstandingAmount).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// reconcilePayment
// ---------------------------------------------------------------------------

describe("reconcilePayment", () => {
  it("matches exact payment", () => {
    const record = makeRecord("payment-term", 1000, 0);
    const result = reconcilePayment(record, 1000);
    expect(result.matched).toBe(true);
    expect(result.discrepancy).toBe(0);
    expect(result.requiresManualReview).toBe(false);
  });

  it("matches payment within 2% tolerance", () => {
    const record = makeRecord("payment-term", 1000, 0);
    const result = reconcilePayment(record, 985); // 1.5% under
    expect(result.matched).toBe(true);
  });

  it("rejects payment beyond tolerance", () => {
    const record = makeRecord("payment-term", 1000, 0);
    const result = reconcilePayment(record, 900); // 10% under
    expect(result.matched).toBe(false);
    expect(result.requiresManualReview).toBe(true);
  });
});
