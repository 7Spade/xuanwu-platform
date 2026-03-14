import { describe, it, expect } from "vitest";
import {
  AUDITABLE_ACTIONS,
  isActionAuditable,
  filterByResource,
  filterByActor,
  filterByWorkspace,
  groupByAction,
  groupByResourceType,
  computeComplianceRate,
  sortByOccurredAt,
} from "../_service";
import type { AuditEntry, ActorRef, ResourceRef } from "../_entity";
import type { AuditAction } from "../_value-objects";

function makeEntry(
  id: string,
  action: AuditAction,
  resourceType: string,
  workspaceId = "ws-1",
  actorAccountId = "acc-1",
  occurredAt = "2024-01-01T00:00:00Z",
  outcome: "success" | "blocked" = "success",
): AuditEntry {
  const actor: ActorRef = { identityId: "id-1", accountId: actorAccountId, accountHandle: null };
  const resource: ResourceRef = { resourceType, resourceId: id, workspaceId };
  return { id: id as AuditEntry["id"], actor, action, resource, outcome, occurredAt };
}

// ---------------------------------------------------------------------------
// isActionAuditable
// ---------------------------------------------------------------------------

describe("isActionAuditable", () => {
  it("returns true for known auditable actions", () => {
    expect(isActionAuditable("created")).toBe(true);
    expect(isActionAuditable("deleted")).toBe(true);
    expect(isActionAuditable("approved")).toBe(true);
  });

  it("returns false for unknown actions", () => {
    expect(isActionAuditable("unknown-action")).toBe(false);
  });

  it("AUDITABLE_ACTIONS is a non-empty set", () => {
    expect(AUDITABLE_ACTIONS.size).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// filterByResource
// ---------------------------------------------------------------------------

describe("filterByResource", () => {
  it("filters by resourceType", () => {
    const entries = [
      makeEntry("1", "created", "task"),
      makeEntry("2", "updated", "file"),
    ];
    expect(filterByResource(entries, "task")).toHaveLength(1);
  });

  it("filters by resourceType and resourceId", () => {
    const entries = [
      makeEntry("task-1", "created", "task"),
      makeEntry("task-2", "updated", "task"),
    ];
    expect(filterByResource(entries, "task", "task-1")).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// filterByActor
// ---------------------------------------------------------------------------

describe("filterByActor", () => {
  it("returns entries for the given actor", () => {
    const entries = [
      makeEntry("1", "created", "task", "ws-1", "acc-1"),
      makeEntry("2", "deleted", "file", "ws-1", "acc-2"),
    ];
    expect(filterByActor(entries, "acc-1")).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// filterByWorkspace
// ---------------------------------------------------------------------------

describe("filterByWorkspace", () => {
  it("returns entries for the given workspace", () => {
    const entries = [
      makeEntry("1", "created", "task", "ws-a"),
      makeEntry("2", "updated", "task", "ws-b"),
    ];
    expect(filterByWorkspace(entries, "ws-a")).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// groupByAction
// ---------------------------------------------------------------------------

describe("groupByAction", () => {
  it("groups entries by action", () => {
    const entries = [
      makeEntry("1", "created", "task"),
      makeEntry("2", "created", "file"),
      makeEntry("3", "deleted", "task"),
    ];
    const grouped = groupByAction(entries);
    expect(grouped["created"]).toHaveLength(2);
    expect(grouped["deleted"]).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// groupByResourceType
// ---------------------------------------------------------------------------

describe("groupByResourceType", () => {
  it("groups entries by resource type", () => {
    const entries = [
      makeEntry("1", "created", "task"),
      makeEntry("2", "updated", "task"),
      makeEntry("3", "created", "file"),
    ];
    const grouped = groupByResourceType(entries);
    expect(grouped["task"]).toHaveLength(2);
    expect(grouped["file"]).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// computeComplianceRate
// ---------------------------------------------------------------------------

describe("computeComplianceRate", () => {
  it("returns 1 for empty entries", () => {
    expect(computeComplianceRate([], () => true)).toBe(1);
  });

  it("computes correct rate for successful outcomes", () => {
    const entries = [
      makeEntry("1", "created", "task", "ws-1", "acc-1", "2024-01-01T00:00:00Z", "success"),
      makeEntry("2", "deleted", "task", "ws-1", "acc-1", "2024-01-01T00:00:00Z", "blocked"),
    ];
    const rate = computeComplianceRate(entries, (e) => e.outcome === "success");
    expect(rate).toBe(0.5);
  });

  it("returns 1 when all entries pass predicate", () => {
    const entries = [makeEntry("1", "created", "task")];
    expect(computeComplianceRate(entries, () => true)).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// sortByOccurredAt
// ---------------------------------------------------------------------------

describe("sortByOccurredAt", () => {
  it("sorts descending by default", () => {
    const entries = [
      makeEntry("1", "created", "task", "ws-1", "acc-1", "2024-01-01T00:00:00Z"),
      makeEntry("2", "updated", "task", "ws-1", "acc-1", "2024-01-03T00:00:00Z"),
      makeEntry("3", "deleted", "task", "ws-1", "acc-1", "2024-01-02T00:00:00Z"),
    ];
    const sorted = sortByOccurredAt(entries);
    expect(sorted[0]!.id).toBe("2");
    expect(sorted[sorted.length - 1]!.id).toBe("1");
  });

  it("sorts ascending when specified", () => {
    const entries = [
      makeEntry("1", "created", "task", "ws-1", "acc-1", "2024-01-03T00:00:00Z"),
      makeEntry("2", "deleted", "task", "ws-1", "acc-1", "2024-01-01T00:00:00Z"),
    ];
    const sorted = sortByOccurredAt(entries, "asc");
    expect(sorted[0]!.id).toBe("2");
  });
});
