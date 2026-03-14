// causal-graph.module / domain.causal-graph / _ports.ts
import type { CausalNode, CausalEdge, CausalPath, CausalNodeId } from './_entity';
import type { CausalDirection, ImpactScope } from './_value-objects';

export interface ICausalNodeRepository {
  findById(id: CausalNodeId): Promise<CausalNode | null>;
  findBySourceRef(sourceRef: string): Promise<CausalNode | null>;
  save(node: CausalNode): Promise<void>;
}

export interface ICausalEdgeRepository {
  findByCauseNodeId(nodeId: CausalNodeId): Promise<CausalEdge[]>;
  findByEffectNodeId(nodeId: CausalNodeId): Promise<CausalEdge[]>;
  save(edge: CausalEdge): Promise<void>;
}

export interface ICausalPathQuery {
  resolveImpactScope(
    triggerNodeId: CausalNodeId,
    direction: CausalDirection,
    maxDepth: number
  ): Promise<ImpactScope>;
  resolvePath(
    fromNodeId: CausalNodeId,
    toNodeId: CausalNodeId
  ): Promise<CausalPath | null>;
}
