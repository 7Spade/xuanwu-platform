// causal-graph.module / domain.causal-graph / _entity.ts
// Aggregate Root: CausalNode
// Aggregate: CausalEdge (child, but stored independently for graph traversal)

export type CausalNodeId = string;
export type CausalNodeKind =
  | 'work-item'
  | 'milestone'
  | 'cr'
  | 'qa'
  | 'baseline'
  | 'domain-event'
  | 'settlement'
  | 'audit-entry';

export interface CausalNode {
  readonly id: CausalNodeId;
  readonly kind: CausalNodeKind;
  /** Reference to the originating domain entity (e.g. WorkItem ID in work.module) */
  readonly sourceRef: string;
  readonly label: string;
  readonly occurredAt: string;
}

export interface CausalEdge {
  readonly id: string;
  readonly causeNodeId: CausalNodeId;
  readonly effectNodeId: CausalNodeId;
  /** Confidence score: 0–1.0 (1.0 = deterministic, <1.0 = inferred) */
  readonly confidence: number;
  readonly reason?: string;
  readonly createdAt: string;
}

/** A resolved chain from root cause to terminal effect */
export interface CausalPath {
  readonly rootNodeId: CausalNodeId;
  readonly nodes: CausalNode[];
  readonly edges: CausalEdge[];
  readonly resolvedAt: string;
}
