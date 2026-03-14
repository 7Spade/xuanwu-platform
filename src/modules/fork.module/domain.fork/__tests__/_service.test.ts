import { describe, it, expect } from "vitest";
import {
  canTransitionForkStatus,
  hasPendingCR,
  isMergeBackEligible,
  isForkClosed,
  computeDivergenceCount,
  buildDivergenceSummary,
  VALID_FORK_TRANSITIONS,
} from "../_service";
import type { ForkEntity } from "../_entity";

function makeFork(status: ForkEntity["status"], pendingCRId?: string): ForkEntity {
  return {
    id: "fork-1",
    originWorkspaceId: "ws-origin",
    forkedByAccountId: "acc-1",
    baselineVersion: "v1",
    status,
    pendingCRId: pendingCRId,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  };
}

// ---------------------------------------------------------------------------
// canTransitionForkStatus
// ---------------------------------------------------------------------------

describe("canTransitionForkStatus", () => {
  it("allows active → merged", () => {
    expect(canTransitionForkStatus("active", "merged")).toBe(true);
  });

  it("allows active → abandoned", () => {
    expect(canTransitionForkStatus("active", "abandoned")).toBe(true);
  });

  it("rejects merged → active (terminal state)", () => {
    expect(canTransitionForkStatus("merged", "active")).toBe(false);
  });

  it("rejects abandoned → merged (terminal state)", () => {
    expect(canTransitionForkStatus("abandoned", "merged")).toBe(false);
  });

  it("VALID_FORK_TRANSITIONS defines terminal states with empty arrays", () => {
    expect(VALID_FORK_TRANSITIONS["merged"]).toHaveLength(0);
    expect(VALID_FORK_TRANSITIONS["abandoned"]).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// hasPendingCR
// ---------------------------------------------------------------------------

describe("hasPendingCR", () => {
  it("returns true when pendingCRId is set", () => {
    expect(hasPendingCR(makeFork("active", "cr-1"))).toBe(true);
  });

  it("returns false when pendingCRId is null", () => {
    expect(hasPendingCR(makeFork("active"))).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// isMergeBackEligible / isForkClosed
// ---------------------------------------------------------------------------

describe("isMergeBackEligible", () => {
  it("returns true for active fork", () => {
    expect(isMergeBackEligible(makeFork("active"))).toBe(true);
  });

  it("returns false for merged fork", () => {
    expect(isMergeBackEligible(makeFork("merged"))).toBe(false);
  });
});

describe("isForkClosed", () => {
  it("returns true for merged fork", () => {
    expect(isForkClosed(makeFork("merged"))).toBe(true);
  });

  it("returns true for abandoned fork", () => {
    expect(isForkClosed(makeFork("abandoned"))).toBe(true);
  });

  it("returns false for active fork", () => {
    expect(isForkClosed(makeFork("active"))).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// computeDivergenceCount
// ---------------------------------------------------------------------------

describe("computeDivergenceCount", () => {
  it("returns count of items in fork not in origin", () => {
    const forked = ["a", "b", "c"];
    const origin = ["b", "c"];
    expect(computeDivergenceCount(forked, origin)).toBe(1);
  });

  it("returns 0 when no divergence", () => {
    const items = ["a", "b"];
    expect(computeDivergenceCount(items, items)).toBe(0);
  });

  it("returns full length when origin is empty", () => {
    expect(computeDivergenceCount(["a", "b"], [])).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// buildDivergenceSummary
// ---------------------------------------------------------------------------

describe("buildDivergenceSummary", () => {
  it("builds human-readable summary string", () => {
    const summary = buildDivergenceSummary(2, 1, 0);
    expect(summary).toContain("2");
    expect(summary).toContain("1");
  });

  it("handles all-zero counts", () => {
    const summary = buildDivergenceSummary(0, 0, 0);
    expect(typeof summary).toBe("string");
  });
});
