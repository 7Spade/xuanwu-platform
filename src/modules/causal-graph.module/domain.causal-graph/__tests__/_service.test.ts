import { describe, it, expect } from "vitest";
import {
  buildCausalNode,
  buildCausalEdge,
  resolveCausalPath,
  computeImpactScope,
  detectCycles,
  mergeImpactScopes,
} from "../_service";
import type { CausalNode, CausalEdge, CausalNodeId } from "../_entity";

const NOW = "2024-01-01T00:00:00Z";

function node(id: string): CausalNode {
  return buildCausalNode(id as CausalNodeId, "domain-event", `ref-${id}`, `Node ${id}`, NOW);
}

function edge(id: string, from: string, to: string, confidence = 1): CausalEdge {
  return buildCausalEdge(id, from as CausalNodeId, to as CausalNodeId, confidence, NOW);
}

// ---------------------------------------------------------------------------
// buildCausalNode / buildCausalEdge
// ---------------------------------------------------------------------------

describe("buildCausalNode", () => {
  it("creates a CausalNode with provided fields", () => {
    const n = buildCausalNode("n1" as CausalNodeId, "domain-event", "ref-1", "Node 1", NOW);
    expect(n.id).toBe("n1");
    expect(n.kind).toBe("domain-event");
    expect(n.label).toBe("Node 1");
  });
});

describe("buildCausalEdge", () => {
  it("creates a CausalEdge with provided fields", () => {
    const e = buildCausalEdge("e1", "n1" as CausalNodeId, "n2" as CausalNodeId, 0.9, NOW, "reason");
    expect(e.causeNodeId).toBe("n1");
    expect(e.effectNodeId).toBe("n2");
    expect(e.confidence).toBe(0.9);
    expect(e.reason).toBe("reason");
  });
});

// ---------------------------------------------------------------------------
// resolveCausalPath
// ---------------------------------------------------------------------------

describe("resolveCausalPath", () => {
  it("finds the direct path between two connected nodes", () => {
    const nodes = [node("A"), node("B"), node("C")];
    const edges = [edge("e1", "A", "B"), edge("e2", "B", "C")];
    const path = resolveCausalPath(nodes, edges, "A" as CausalNodeId, "C" as CausalNodeId);
    expect(path).not.toBeNull();
    expect(path!.nodes.map((n) => n.id)).toEqual(["A", "B", "C"]);
  });

  it("returns null when there is no path", () => {
    const nodes = [node("A"), node("B")];
    const edges: CausalEdge[] = [];
    expect(resolveCausalPath(nodes, edges, "A" as CausalNodeId, "B" as CausalNodeId)).toBeNull();
  });

  it("returns null for self-path (same node)", () => {
    const nodes = [node("A")];
    expect(resolveCausalPath(nodes, [], "A" as CausalNodeId, "A" as CausalNodeId)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// computeImpactScope
// ---------------------------------------------------------------------------

describe("computeImpactScope", () => {
  it("computes downstream impact scope", () => {
    const nodes = [node("A"), node("B"), node("C")];
    const edges = [edge("e1", "A", "B"), edge("e2", "B", "C")];
    const scope = computeImpactScope(nodes, edges, "A" as CausalNodeId, "downstream", 5);
    expect(scope.affectedNodeIds).toContain("B");
    expect(scope.affectedNodeIds).toContain("C");
    expect(scope.affectedNodeIds).not.toContain("A"); // trigger excluded
  });

  it("respects maxDepth=1", () => {
    const nodes = [node("A"), node("B"), node("C")];
    const edges = [edge("e1", "A", "B"), edge("e2", "B", "C")];
    const scope = computeImpactScope(nodes, edges, "A" as CausalNodeId, "downstream", 1);
    expect(scope.affectedNodeIds).toContain("B");
    expect(scope.affectedNodeIds).not.toContain("C"); // too deep
  });

  it("returns empty scope for a leaf node", () => {
    const nodes = [node("A")];
    const scope = computeImpactScope(nodes, [], "A" as CausalNodeId, "downstream", 5);
    expect(scope.affectedNodeIds).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// detectCycles
// ---------------------------------------------------------------------------

describe("detectCycles", () => {
  it("returns empty array for an acyclic graph", () => {
    const nodes = [node("A"), node("B"), node("C")];
    const edges = [edge("e1", "A", "B"), edge("e2", "B", "C")];
    expect(detectCycles(nodes, edges)).toHaveLength(0);
  });

  it("detects a simple cycle A→B→A", () => {
    const nodes = [node("A"), node("B")];
    const edges = [edge("e1", "A", "B"), edge("e2", "B", "A")];
    const cycles = detectCycles(nodes, edges);
    expect(cycles.length).toBeGreaterThan(0);
  });

  it("detects an indirect cycle A→B→C→A", () => {
    const nodes = [node("A"), node("B"), node("C")];
    const edges = [edge("e1", "A", "B"), edge("e2", "B", "C"), edge("e3", "C", "A")];
    const cycles = detectCycles(nodes, edges);
    expect(cycles.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// mergeImpactScopes
// ---------------------------------------------------------------------------

describe("mergeImpactScopes", () => {
  it("merges scopes by unioning affectedNodeIds", () => {
    const s1 = { triggerNodeId: "A" as CausalNodeId, affectedNodeIds: ["B" as CausalNodeId], maxDepth: 1, resolvedAt: NOW };
    const s2 = { triggerNodeId: "A" as CausalNodeId, affectedNodeIds: ["C" as CausalNodeId, "D" as CausalNodeId], maxDepth: 2, resolvedAt: NOW };
    const merged = mergeImpactScopes([s1, s2]);
    expect(merged.affectedNodeIds).toHaveLength(3);
    expect(merged.maxDepth).toBe(2);
  });

  it("throws for empty scopes array", () => {
    expect(() => mergeImpactScopes([])).toThrow();
  });

  it("throws when triggerNodeIds differ", () => {
    const s1 = { triggerNodeId: "A" as CausalNodeId, affectedNodeIds: [], maxDepth: 1, resolvedAt: NOW };
    const s2 = { triggerNodeId: "B" as CausalNodeId, affectedNodeIds: [], maxDepth: 1, resolvedAt: NOW };
    expect(() => mergeImpactScopes([s1, s2])).toThrow();
  });
});
