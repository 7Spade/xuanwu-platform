"use client";
/**
 * useCausalGraph — fetches causal nodes and edges for a workspace.
 *
 * Wave 57: presentation hook for causal-graph.module.
 * Uses FirestoreCausalEdgeRepository for edge queries and a direct Firestore
 * query for nodes (scoped by workspaceId field on the causal-nodes collection).
 */

import { useState, useEffect, useMemo } from "react";
import { FirestoreCausalEdgeRepository } from "../infra.firestore/_repository";
import type { CausalNode, CausalEdge, CausalNodeId } from "../domain.causal-graph/_entity";
import { getFirestore, collection, getDocs, query, where, QueryDocumentSnapshot } from "firebase/firestore";

// ---------------------------------------------------------------------------
// Firestore document shape
// ---------------------------------------------------------------------------

interface CausalNodeDoc {
  kind: string;
  sourceRef: string;
  label: string;
  occurredAt: string;
  workspaceId?: string;
}

function docToCausalNode(d: QueryDocumentSnapshot): CausalNode {
  const data = d.data() as CausalNodeDoc;
  return {
    id: d.id as CausalNodeId,
    kind: data.kind as CausalNode["kind"],
    sourceRef: data.sourceRef,
    label: data.label,
    occurredAt: data.occurredAt,
  };
}

async function fetchNodesByWorkspace(workspaceId: string): Promise<CausalNode[]> {
  try {
    const db = getFirestore();
    const col = collection(db, "causal-nodes");
    const q = query(col, where("workspaceId", "==", workspaceId));
    const snap = await getDocs(q);
    return snap.docs.map(docToCausalNode);
  } catch {
    return [];
  }
}

async function fetchEdgesForNodes(
  edgeRepo: FirestoreCausalEdgeRepository,
  nodeIds: CausalNodeId[],
): Promise<CausalEdge[]> {
  const edgeMap = new Map<string, CausalEdge>();
  await Promise.all(
    nodeIds.map(async (id) => {
      const edges = await edgeRepo.findByCauseNodeId(id);
      edges.forEach((e) => edgeMap.set(e.id, e));
    }),
  );
  return Array.from(edgeMap.values());
}

export interface UseCausalGraphResult {
  nodes: CausalNode[];
  edges: CausalEdge[];
  loading: boolean;
  error: string | null;
}

export function useCausalGraph(workspaceId: string | null | undefined): UseCausalGraphResult {
  const edgeRepo = useMemo(() => new FirestoreCausalEdgeRepository(), []);
  const [nodes, setNodes] = useState<CausalNode[]>([]);
  const [edges, setEdges] = useState<CausalEdge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!workspaceId) {
      setNodes([]);
      setEdges([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchNodesByWorkspace(workspaceId)
      .then(async (fetchedNodes) => {
        if (cancelled) return;
        const fetchedEdges = await fetchEdgesForNodes(
          edgeRepo,
          fetchedNodes.map((n) => n.id),
        );
        if (cancelled) return;
        setNodes(fetchedNodes);
        setEdges(fetchedEdges);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [edgeRepo, workspaceId]);

  return { nodes, edges, loading, error };
}
