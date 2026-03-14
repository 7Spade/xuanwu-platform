import { describe, it, expect } from "vitest";
import {
  detectDependencyCycle,
  getBlockingItems,
  calculateMilestoneProgress,
} from "../_service";
import type { WorkItemEntity } from "../_entity";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeItem(
  id: string,
  status: "open" | "in-progress" | "closed" = "open",
  deps: Array<{ type: "depends-on" | "blocks"; targetId: string }> = [],
): WorkItemEntity {
  return {
    id,
    workspaceId: "ws-1",
    title: `Item ${id}`,
    status,
    priority: "medium",
    dependencies: deps.map((d) => ({ sourceId: id, targetId: d.targetId, type: d.type })),
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  };
}

// ---------------------------------------------------------------------------
// detectDependencyCycle
// ---------------------------------------------------------------------------

describe("detectDependencyCycle", () => {
  it("returns true for a direct self-loop", () => {
    expect(detectDependencyCycle(new Map(), "A", "A")).toBe(true);
  });

  it("returns false for an empty graph", () => {
    expect(detectDependencyCycle(new Map(), "A", "B")).toBe(false);
  });

  it("detects a simple A→B→A cycle", () => {
    const adj: Map<string, string[]> = new Map([["B", ["A"]]]);
    expect(detectDependencyCycle(adj, "A", "B")).toBe(true);
  });

  it("returns false when no cycle exists", () => {
    const adj: Map<string, string[]> = new Map([["A", ["C"]], ["C", ["D"]]]);
    expect(detectDependencyCycle(adj, "B", "A")).toBe(false);
  });

  it("detects an indirect cycle A→B→C→A", () => {
    const adj: Map<string, string[]> = new Map([
      ["B", ["C"]],
      ["C", ["A"]],
    ]);
    expect(detectDependencyCycle(adj, "A", "B")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// getBlockingItems
// ---------------------------------------------------------------------------

describe("getBlockingItems", () => {
  it("returns empty array when no blockers", () => {
    const items = [makeItem("A"), makeItem("B")];
    expect(getBlockingItems(items, "B")).toEqual([]);
  });

  it("finds a single blocking item", () => {
    const items = [
      makeItem("A", "open", [{ type: "blocks", targetId: "B" }]),
      makeItem("B"),
    ];
    expect(getBlockingItems(items, "B")).toEqual(["A"]);
  });

  it("finds multiple blocking items", () => {
    const items = [
      makeItem("A", "open", [{ type: "blocks", targetId: "C" }]),
      makeItem("B", "open", [{ type: "blocks", targetId: "C" }]),
      makeItem("C"),
    ];
    expect(getBlockingItems(items, "C")).toEqual(expect.arrayContaining(["A", "B"]));
  });

  it("ignores depends-on dependency type", () => {
    const items = [
      makeItem("A", "open", [{ type: "depends-on", targetId: "B" }]),
      makeItem("B"),
    ];
    expect(getBlockingItems(items, "B")).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// calculateMilestoneProgress
// ---------------------------------------------------------------------------

describe("calculateMilestoneProgress", () => {
  it("returns 0 for an empty list", () => {
    expect(calculateMilestoneProgress([])).toBe(0);
  });

  it("returns 0 when no items are closed", () => {
    const items = [makeItem("A"), makeItem("B")];
    expect(calculateMilestoneProgress(items)).toBe(0);
  });

  it("returns 100 when all items are closed", () => {
    const items = [makeItem("A", "closed"), makeItem("B", "closed")];
    expect(calculateMilestoneProgress(items)).toBe(100);
  });

  it("computes partial progress correctly", () => {
    const items = [
      makeItem("A", "closed"),
      makeItem("B", "open"),
      makeItem("C", "closed"),
      makeItem("D", "open"),
    ];
    expect(calculateMilestoneProgress(items)).toBe(50);
  });

  it("rounds to nearest integer", () => {
    const items = [makeItem("A", "closed"), makeItem("B"), makeItem("C")];
    expect(calculateMilestoneProgress(items)).toBe(33);
  });
});
