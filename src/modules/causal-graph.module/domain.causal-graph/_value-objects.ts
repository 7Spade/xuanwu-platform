// causal-graph.module / domain.causal-graph / _value-objects.ts

export interface ImpactScope {
  readonly triggerNodeId: string;
  readonly affectedNodeIds: string[];
  readonly maxDepth: number;
  readonly resolvedAt: string;
}

export type CausalDirection = 'upstream' | 'downstream' | 'both';
