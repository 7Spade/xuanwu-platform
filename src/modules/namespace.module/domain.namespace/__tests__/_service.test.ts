import { describe, it, expect } from "vitest";
import {
  RESERVED_NAMESPACE_SLUGS,
  isSlugReserved,
  parseWorkspacePath,
  resolveWorkspaceIdFromPath,
  hasWorkspaceSlug,
  buildWorkspaceBinding,
  addWorkspaceBinding,
  removeWorkspaceBinding,
} from "../_service";
import type { NamespaceEntity } from "../_entity";
import type { NamespaceSlug } from "../_value-objects";

function makeNamespace(workspaces: Array<{ workspaceId: string; workspaceSlug: string }> = []): NamespaceEntity {
  return {
    id: "ns-1",
    slug: "my-org" as NamespaceSlug,
    ownerType: "organization",
    ownerId: "acc-1",
    workspaces: workspaces.map((w) => ({ ...w, boundAt: "2024-01-01T00:00:00Z" })),
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  };
}

// ---------------------------------------------------------------------------
// isSlugReserved
// ---------------------------------------------------------------------------

describe("isSlugReserved", () => {
  it("returns true for a reserved slug", () => {
    expect(isSlugReserved("api")).toBe(true);
    expect(isSlugReserved("admin")).toBe(true);
  });

  it("is case-insensitive", () => {
    expect(isSlugReserved("API")).toBe(true);
    expect(isSlugReserved("Admin")).toBe(true);
  });

  it("returns false for a non-reserved slug", () => {
    expect(isSlugReserved("my-org")).toBe(false);
  });

  it("RESERVED_NAMESPACE_SLUGS contains known reserved names", () => {
    expect(RESERVED_NAMESPACE_SLUGS.has("api")).toBe(true);
    expect(RESERVED_NAMESPACE_SLUGS.has("settings")).toBe(true);
    expect(RESERVED_NAMESPACE_SLUGS.has("login")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// parseWorkspacePath
// ---------------------------------------------------------------------------

describe("parseWorkspacePath", () => {
  it("parses a valid ns-slug/ws-slug path", () => {
    const result = parseWorkspacePath("my-org/my-project");
    expect(result).toEqual({ namespaceSlug: "my-org", workspaceSlug: "my-project" });
  });

  it("returns null for a single-segment path", () => {
    expect(parseWorkspacePath("my-org")).toBeNull();
  });

  it("returns null for an empty string", () => {
    expect(parseWorkspacePath("")).toBeNull();
  });

  it("returns null for a path with more than two segments", () => {
    expect(parseWorkspacePath("a/b/c")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// resolveWorkspaceIdFromPath
// ---------------------------------------------------------------------------

describe("resolveWorkspaceIdFromPath", () => {
  it("resolves a known workspace slug", () => {
    const ns = makeNamespace([{ workspaceId: "ws-1", workspaceSlug: "my-project" }]);
    expect(resolveWorkspaceIdFromPath(ns, "my-project")).toBe("ws-1");
  });

  it("returns null for an unknown workspace slug", () => {
    const ns = makeNamespace();
    expect(resolveWorkspaceIdFromPath(ns, "unknown")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// hasWorkspaceSlug
// ---------------------------------------------------------------------------

describe("hasWorkspaceSlug", () => {
  it("returns true for an existing slug", () => {
    const ns = makeNamespace([{ workspaceId: "ws-1", workspaceSlug: "proj-a" }]);
    expect(hasWorkspaceSlug(ns, "proj-a")).toBe(true);
  });

  it("returns false for an absent slug", () => {
    const ns = makeNamespace();
    expect(hasWorkspaceSlug(ns, "proj-a")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// buildWorkspaceBinding
// ---------------------------------------------------------------------------

describe("buildWorkspaceBinding", () => {
  it("builds a WorkspaceBinding value object", () => {
    const binding = buildWorkspaceBinding("ws-42", "proj-x", "2024-03-01T00:00:00Z");
    expect(binding).toEqual({ workspaceId: "ws-42", workspaceSlug: "proj-x", boundAt: "2024-03-01T00:00:00Z" });
  });
});

// ---------------------------------------------------------------------------
// addWorkspaceBinding
// ---------------------------------------------------------------------------

describe("addWorkspaceBinding", () => {
  it("appends a new binding", () => {
    const ns = makeNamespace();
    const binding = buildWorkspaceBinding("ws-2", "proj-b", "2024-03-01T00:00:00Z");
    const updated = addWorkspaceBinding(ns, binding, "2024-03-01T00:00:00Z");
    expect(updated.workspaces).toHaveLength(1);
    expect(updated.workspaces[0]!.workspaceSlug).toBe("proj-b");
  });

  it("throws when slug already exists", () => {
    const ns = makeNamespace([{ workspaceId: "ws-1", workspaceSlug: "proj-b" }]);
    const binding = buildWorkspaceBinding("ws-2", "proj-b", "2024-03-01T00:00:00Z");
    expect(() => addWorkspaceBinding(ns, binding, "2024-03-01T00:00:00Z")).toThrow();
  });
});

// ---------------------------------------------------------------------------
// removeWorkspaceBinding
// ---------------------------------------------------------------------------

describe("removeWorkspaceBinding", () => {
  it("removes an existing binding", () => {
    const ns = makeNamespace([{ workspaceId: "ws-1", workspaceSlug: "proj-a" }]);
    const updated = removeWorkspaceBinding(ns, "ws-1", "2024-03-02T00:00:00Z");
    expect(updated.workspaces).toHaveLength(0);
  });

  it("is a no-op for non-existent workspaceId", () => {
    const ns = makeNamespace([{ workspaceId: "ws-1", workspaceSlug: "proj-a" }]);
    const updated = removeWorkspaceBinding(ns, "ws-999", "2024-03-02T00:00:00Z");
    expect(updated.workspaces).toHaveLength(1);
  });
});
