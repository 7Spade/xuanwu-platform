import { describe, it, expect } from "vitest";
import {
  isWorkspaceVisibleToUser,
  filterVisibleWorkspaces,
  buildTaskTree,
} from "../_service";
import type { WorkspaceEntity, WorkspaceTask } from "../_entity";
import type { WorkspaceId } from "../_value-objects";

function makeWorkspace(
  id: string,
  dimensionId: string,
  visibility: WorkspaceEntity["visibility"] = "visible",
  grants: WorkspaceEntity["grants"] = [],
  teamIds: string[] = [],
): WorkspaceEntity {
  return {
    id: id as WorkspaceId,
    dimensionId,
    namespaceId: null,
    slug: null,
    name: `Workspace ${id}`,
    lifecycleState: "active",
    visibility,
    scope: [],
    protocol: "default",
    grants,
    teamIds,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  };
}

function makeTask(id: string, parentId?: string, progress = 0): WorkspaceTask {
  return {
    id,
    name: `Task ${id}`,
    progressState: "planning",
    priority: "medium",
    subtotal: 0,
    progress,
    parentId,
    createdAt: "2024-01-01T00:00:00Z",
  };
}

// ---------------------------------------------------------------------------
// isWorkspaceVisibleToUser
// ---------------------------------------------------------------------------

describe("isWorkspaceVisibleToUser", () => {
  it("returns true for a visible workspace", () => {
    const ws = makeWorkspace("ws-1", "dim-1", "visible");
    expect(isWorkspaceVisibleToUser(ws, "acc-1", new Set())).toBe(true);
  });

  it("returns false for hidden workspace without grant", () => {
    const ws = makeWorkspace("ws-1", "dim-1", "hidden");
    expect(isWorkspaceVisibleToUser(ws, "acc-stranger", new Set())).toBe(false);
  });

  it("returns true for hidden workspace when user has explicit grant", () => {
    const ws = makeWorkspace("ws-1", "dim-1", "hidden", [
      { grantId: "g1", userId: "acc-1", role: "Viewer", status: "active", grantedAt: "2024-01-01T00:00:00Z" },
    ]);
    expect(isWorkspaceVisibleToUser(ws, "acc-1", new Set())).toBe(true);
  });

  it("returns true for hidden workspace when user belongs to a teamId", () => {
    const ws = makeWorkspace("ws-1", "dim-1", "hidden", [], ["team-a"]);
    expect(isWorkspaceVisibleToUser(ws, "acc-1", new Set(["team-a"]))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// filterVisibleWorkspaces
// ---------------------------------------------------------------------------

describe("filterVisibleWorkspaces", () => {
  it("personal account owner sees all own workspaces", () => {
    const workspaces = [
      makeWorkspace("ws-1", "user-dim", "visible"),
      makeWorkspace("ws-2", "user-dim", "hidden"),
    ];
    const visible = filterVisibleWorkspaces(workspaces, "acc-1", "user-dim", true, "personal", new Set());
    expect(visible).toHaveLength(2);
  });

  it("org owner sees all workspaces in dimension", () => {
    const workspaces = [
      makeWorkspace("ws-1", "org-dim", "visible"),
      makeWorkspace("ws-2", "org-dim", "hidden"),
    ];
    const visible = filterVisibleWorkspaces(workspaces, "acc-owner", "org-dim", true, "organization", new Set());
    expect(visible).toHaveLength(2);
  });

  it("org member sees only visible workspaces or those with access", () => {
    const workspaces = [
      makeWorkspace("ws-1", "org-dim", "visible"),
      makeWorkspace("ws-2", "org-dim", "hidden"),
    ];
    const visible = filterVisibleWorkspaces(workspaces, "acc-member", "org-dim", false, "organization", new Set());
    expect(visible).toHaveLength(1);
    expect(visible[0]!.id).toBe("ws-1");
  });
});

// ---------------------------------------------------------------------------
// buildTaskTree
// ---------------------------------------------------------------------------

describe("buildTaskTree", () => {
  it("groups child tasks under parent", () => {
    const tasks = [
      makeTask("t1"),
      makeTask("t2", "t1"),
      makeTask("t3", "t1"),
    ];
    const tree = buildTaskTree(tasks);
    expect(tree).toHaveLength(1);
    expect(tree[0]!.children).toHaveLength(2);
  });

  it("handles flat task list with no parents", () => {
    const tasks = [makeTask("t1"), makeTask("t2")];
    const tree = buildTaskTree(tasks);
    expect(tree).toHaveLength(2);
  });

  it("returns empty tree for no tasks", () => {
    expect(buildTaskTree([])).toHaveLength(0);
  });
});
