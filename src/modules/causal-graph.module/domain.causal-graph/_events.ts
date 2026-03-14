// causal-graph.module / domain.causal-graph / _events.ts

export interface CausalEdgeAdded {
  readonly type: 'CausalEdgeAdded';
  readonly edgeId: string;
  readonly causeNodeId: string;
  readonly effectNodeId: string;
  readonly confidence: number;
  readonly occurredAt: string;
}

export interface ImpactScopeResolved {
  readonly type: 'ImpactScopeResolved';
  readonly triggerNodeId: string;
  readonly affectedCount: number;
  readonly resolvedAt: string;
}

export type CausalGraphDomainEvent = CausalEdgeAdded | ImpactScopeResolved;
