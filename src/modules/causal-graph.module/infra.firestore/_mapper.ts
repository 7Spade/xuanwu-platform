/**
 * causal-graph.module / infra.firestore / _mapper.ts
 *
 * Firestore document ↔ CausalNode / CausalEdge transformation.
 * Keeps all Firestore-specific field names and null-coercions in one place.
 */

import type { CausalNode, CausalEdge, CausalNodeId, CausalNodeKind } from "../domain.causal-graph/_entity";

// ---------------------------------------------------------------------------
// Firestore document shapes (raw, unvalidated)
// ---------------------------------------------------------------------------

/** Raw Firestore document shape for a CausalNode. */
export interface CausalNodeDoc {
  id: string;
  kind: string;
  sourceRef: string;
  label: string;
  occurredAt: string;
}

/** Raw Firestore document shape for a CausalEdge. */
export interface CausalEdgeDoc {
  id: string;
  causeNodeId: string;
  effectNodeId: string;
  confidence: number;
  reason: string | null;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Converters
// ---------------------------------------------------------------------------

export function causalNodeDocToEntity(doc: CausalNodeDoc): CausalNode {
  return {
    id: doc.id as CausalNodeId,
    kind: doc.kind as CausalNodeKind,
    sourceRef: doc.sourceRef,
    label: doc.label,
    occurredAt: doc.occurredAt,
  };
}

export function causalNodeToDoc(node: CausalNode): CausalNodeDoc {
  return {
    id: node.id,
    kind: node.kind,
    sourceRef: node.sourceRef,
    label: node.label,
    occurredAt: node.occurredAt,
  };
}

export function causalEdgeDocToEntity(doc: CausalEdgeDoc): CausalEdge {
  return {
    id: doc.id,
    causeNodeId: doc.causeNodeId as CausalNodeId,
    effectNodeId: doc.effectNodeId as CausalNodeId,
    confidence: doc.confidence,
    reason: doc.reason ?? undefined,
    createdAt: doc.createdAt,
  };
}

export function causalEdgeToDoc(edge: CausalEdge): CausalEdgeDoc {
  return {
    id: edge.id,
    causeNodeId: edge.causeNodeId,
    effectNodeId: edge.effectNodeId,
    confidence: edge.confidence,
    reason: edge.reason ?? null,
    createdAt: edge.createdAt,
  };
}
