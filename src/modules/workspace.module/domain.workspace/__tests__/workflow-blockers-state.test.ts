import { describe, it, expect } from "vitest";

import {
  applyWorkflowBlocked,
  applyWorkflowUnblocked,
  deriveWorkflowBlockersFromSources,
  summarizeWorkflowBlockers,
  type WorkflowBlockersState,
} from "../workflow-blockers-state";

describe("applyWorkflowBlocked", () => {
  it("adds a new workflow with blockedByCount", () => {
    const state: WorkflowBlockersState = {};
    const next = applyWorkflowBlocked(state, "wf-1", 3);
    expect(next["wf-1"]).toBe(3);
  });

  it("clamps to minimum 1 even when count is 0", () => {
    const state: WorkflowBlockersState = {};
    const next = applyWorkflowBlocked(state, "wf-2", 0);
    expect(next["wf-2"]).toBe(1);
  });

  it("overwrites existing entry", () => {
    const state: WorkflowBlockersState = { "wf-1": 2 };
    const next = applyWorkflowBlocked(state, "wf-1", 5);
    expect(next["wf-1"]).toBe(5);
  });

  it("does not mutate input state", () => {
    const state: WorkflowBlockersState = {};
    applyWorkflowBlocked(state, "wf-1", 1);
    expect(Object.keys(state)).toHaveLength(0);
  });
});

describe("applyWorkflowUnblocked", () => {
  it("removes a workflow when blockedByCount is 0", () => {
    const state: WorkflowBlockersState = { "wf-1": 2, "wf-2": 1 };
    const next = applyWorkflowUnblocked(state, "wf-1");
    expect(next["wf-1"]).toBeUndefined();
    expect(next["wf-2"]).toBe(1);
  });

  it("keeps workflow with updated count when blockedByCount > 0", () => {
    const state: WorkflowBlockersState = { "wf-1": 3 };
    const next = applyWorkflowUnblocked(state, "wf-1", 2);
    expect(next["wf-1"]).toBe(2);
  });

  it("handles removing a non-existent workflow gracefully", () => {
    const state: WorkflowBlockersState = { "wf-2": 1 };
    const next = applyWorkflowUnblocked(state, "wf-999");
    expect(next).toEqual({ "wf-2": 1 });
  });
});

describe("deriveWorkflowBlockersFromSources", () => {
  it("returns empty state when no sources are blocked", () => {
    const sources = [{ workflowId: "wf-1", blockedBy: [] }];
    expect(deriveWorkflowBlockersFromSources(sources)).toEqual({});
  });

  it("counts blockedBy lengths correctly", () => {
    const sources = [
      { workflowId: "wf-1", blockedBy: ["a", "b"] },
      { workflowId: "wf-2", blockedBy: ["c"] },
    ];
    const state = deriveWorkflowBlockersFromSources(sources);
    expect(state["wf-1"]).toBe(2);
    expect(state["wf-2"]).toBe(1);
  });

  it("skips sources without blockedBy field", () => {
    const sources = [{ workflowId: "wf-1" }, { workflowId: "wf-2", blockedBy: ["x"] }];
    const state = deriveWorkflowBlockersFromSources(sources);
    expect(state["wf-1"]).toBeUndefined();
    expect(state["wf-2"]).toBe(1);
  });
});

describe("summarizeWorkflowBlockers", () => {
  it("returns all-zero summary for empty state", () => {
    const summary = summarizeWorkflowBlockers({});
    expect(summary).toEqual({
      blockedWorkflowCount: 0,
      totalBlockedByCount: 0,
      hasBlockedWorkflows: false,
    });
  });

  it("counts workflows and total blockers correctly", () => {
    const state: WorkflowBlockersState = { "wf-1": 3, "wf-2": 1 };
    const summary = summarizeWorkflowBlockers(state);
    expect(summary.blockedWorkflowCount).toBe(2);
    expect(summary.totalBlockedByCount).toBe(4);
    expect(summary.hasBlockedWorkflows).toBe(true);
  });
});
