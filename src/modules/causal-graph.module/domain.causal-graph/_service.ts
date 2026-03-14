/**
 * Causal-graph domain service — pure business-rule functions for traversing
 * the CausalNode / CausalEdge graph.
 *
 * Derived from the BFS/DFS traversal patterns in `semantic-graph.slice`.
 * All functions operate over pre-loaded node and edge arrays; no I/O.
 */

import type { CausalNode, CausalEdge, CausalPath, CausalNodeId, CausalNodeKind } from "./_entity";
import type { ImpactScope, CausalDirection } from "./_value-objects";

// ---------------------------------------------------------------------------
// Factory helpers
// ---------------------------------------------------------------------------

/** Builds a new CausalNode value object. */
export function buildCausalNode(
  id: CausalNodeId,
  kind: CausalNodeKind,
  sourceRef: string,
  label: string,
  occurredAt: string,
): CausalNode {
  return { id, kind, sourceRef, label, occurredAt };
}

/** Builds a new CausalEdge value object. */
export function buildCausalEdge(
  id: string,
  causeNodeId: CausalNodeId,
  effectNodeId: CausalNodeId,
  confidence: number,
  createdAt: string,
  reason?: string,
): CausalEdge {
  return { id, causeNodeId, effectNodeId, confidence, reason, createdAt };
}

// ---------------------------------------------------------------------------
// Graph helpers
// ---------------------------------------------------------------------------

/** Builds adjacency maps from a flat edge array for efficient traversal. */
function buildAdjacencyMaps(edges: CausalEdge[]): {
  downstream: Map<CausalNodeId, CausalNodeId[]>;
  upstream: Map<CausalNodeId, CausalNodeId[]>;
} {
  const downstream = new Map<CausalNodeId, CausalNodeId[]>();
  const upstream = new Map<CausalNodeId, CausalNodeId[]>();
  for (const edge of edges) {
    const ds = downstream.get(edge.causeNodeId) ?? [];
    ds.push(edge.effectNodeId);
    downstream.set(edge.causeNodeId, ds);

    const us = upstream.get(edge.effectNodeId) ?? [];
    us.push(edge.causeNodeId);
    upstream.set(edge.effectNodeId, us);
  }
  return { downstream, upstream };
}

// ---------------------------------------------------------------------------
// Path resolution (BFS)
// ---------------------------------------------------------------------------

/**
 * Resolves the shortest causal path from `fromId` to `toId` using BFS over
 * the downstream (cause → effect) direction.
 *
 * Returns `null` when no path exists.
 */
export function resolveCausalPath(
  nodes: CausalNode[],
  edges: CausalEdge[],
  fromId: CausalNodeId,
  toId: CausalNodeId,
): CausalPath | null {
  if (fromId === toId) return null;

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const edgeMap = new Map(edges.map((e) => [e.id, e]));
  const { downstream } = buildAdjacencyMaps(edges);

  // BFS — track predecessor nodeId + edgeId for path reconstruction
  const visited = new Set<CausalNodeId>();
  const queue: CausalNodeId[] = [fromId];
  const prev = new Map<CausalNodeId, { fromNode: CausalNodeId; viaEdge: CausalEdge }>();
  visited.add(fromId);

  while (queue.length > 0) {
    const current = queue.shift()!;
    const neighbours = downstream.get(current) ?? [];
    for (const neighbour of neighbours) {
      if (visited.has(neighbour)) continue;
      // Find the edge between current and neighbour
      const connectingEdge = edges.find(
        (e) => e.causeNodeId === current && e.effectNodeId === neighbour,
      );
      if (!connectingEdge) continue;
      prev.set(neighbour, { fromNode: current, viaEdge: connectingEdge });
      if (neighbour === toId) {
        return reconstructPath(fromId, toId, prev, nodeMap, new Date().toISOString());
      }
      visited.add(neighbour);
      queue.push(neighbour);
    }
  }
  return null;
}

function reconstructPath(
  fromId: CausalNodeId,
  toId: CausalNodeId,
  prev: Map<CausalNodeId, { fromNode: CausalNodeId; viaEdge: CausalEdge }>,
  nodeMap: Map<CausalNodeId, CausalNode>,
  resolvedAt: string,
): CausalPath {
  const edgesInPath: CausalEdge[] = [];
  const nodeIds: CausalNodeId[] = [];
  let current = toId;
  while (current !== fromId) {
    const entry = prev.get(current)!;
    edgesInPath.unshift(entry.viaEdge);
    nodeIds.unshift(current);
    current = entry.fromNode;
  }
  nodeIds.unshift(fromId);
  const pathNodes = nodeIds.map((id) => nodeMap.get(id)).filter(Boolean) as CausalNode[];
  return { rootNodeId: fromId, nodes: pathNodes, edges: edgesInPath, resolvedAt };
}

// ---------------------------------------------------------------------------
// Impact scope (BFS/DFS bounded traversal)
// ---------------------------------------------------------------------------

/**
 * Computes the set of CausalNode IDs reachable from `triggerNodeId` within
 * `maxDepth` steps in the requested `direction`.
 */
export function computeImpactScope(
  nodes: CausalNode[],
  edges: CausalEdge[],
  triggerNodeId: CausalNodeId,
  direction: CausalDirection,
  maxDepth: number,
): ImpactScope {
  const { downstream, upstream } = buildAdjacencyMaps(edges);

  const getNeighbours = (nodeId: CausalNodeId): CausalNodeId[] => {
    if (direction === "downstream") return downstream.get(nodeId) ?? [];
    if (direction === "upstream") return upstream.get(nodeId) ?? [];
    // both
    return [
      ...(downstream.get(nodeId) ?? []),
      ...(upstream.get(nodeId) ?? []),
    ];
  };

  const visited = new Set<CausalNodeId>([triggerNodeId]);
  let frontier = [triggerNodeId];
  let depth = 0;

  while (frontier.length > 0 && depth < maxDepth) {
    const next: CausalNodeId[] = [];
    for (const nodeId of frontier) {
      for (const neighbour of getNeighbours(nodeId)) {
        if (!visited.has(neighbour)) {
          visited.add(neighbour);
          next.push(neighbour);
        }
      }
    }
    frontier = next;
    depth++;
  }

  visited.delete(triggerNodeId); // exclude trigger itself from affectedNodeIds

  return {
    triggerNodeId,
    affectedNodeIds: [...visited],
    maxDepth,
    resolvedAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Cycle detection
// ---------------------------------------------------------------------------

/**
 * Detects cycles in the causal graph using DFS with a recursion stack.
 * Returns an array of cycle paths (arrays of node IDs forming each cycle).
 * Returns an empty array when the graph is acyclic.
 */
export function detectCycles(
  nodes: CausalNode[],
  edges: CausalEdge[],
): CausalNodeId[][] {
  const { downstream } = buildAdjacencyMaps(edges);
  const visited = new Set<CausalNodeId>();
  const inStack = new Set<CausalNodeId>();
  const cycles: CausalNodeId[][] = [];

  function dfs(nodeId: CausalNodeId, path: CausalNodeId[]): void {
    visited.add(nodeId);
    inStack.add(nodeId);
    path.push(nodeId);

    for (const neighbour of downstream.get(nodeId) ?? []) {
      if (!visited.has(neighbour)) {
        dfs(neighbour, path);
      } else if (inStack.has(neighbour)) {
        // Found a cycle — extract the cycle portion of path
        const cycleStart = path.indexOf(neighbour);
        cycles.push(path.slice(cycleStart));
      }
    }

    path.pop();
    inStack.delete(nodeId);
  }

  for (const node of nodes) {
    if (!visited.has(node.id)) {
      dfs(node.id, []);
    }
  }

  return cycles;
}

// ---------------------------------------------------------------------------
// Scope merging
// ---------------------------------------------------------------------------

/**
 * Merges multiple ImpactScope objects that share the same `triggerNodeId` into
 * one, taking the union of all `affectedNodeIds` and the maximum `maxDepth`.
 *
 * Throws when scopes have different `triggerNodeId` values.
 */
export function mergeImpactScopes(scopes: ImpactScope[]): ImpactScope {
  if (scopes.length === 0) {
    throw new Error("mergeImpactScopes: scopes array must not be empty");
  }
  const triggerNodeId = scopes[0]!.triggerNodeId;
  if (!scopes.every((s) => s.triggerNodeId === triggerNodeId)) {
    throw new Error("mergeImpactScopes: all scopes must share the same triggerNodeId");
  }
  const union = new Set<CausalNodeId>();
  let maxD = 0;
  for (const scope of scopes) {
    for (const id of scope.affectedNodeIds) union.add(id);
    if (scope.maxDepth > maxD) maxD = scope.maxDepth;
  }
  return {
    triggerNodeId,
    affectedNodeIds: [...union],
    maxDepth: maxD,
    resolvedAt: new Date().toISOString(),
  };
}
