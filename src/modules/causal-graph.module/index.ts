// causal-graph.module — Public API barrel
// Bounded Context: Causal Graph · Impact Analysis / 因果圖 · 影響分析
export type { CausalNodeDTO, ImpactScopeDTO } from "./core/_use-cases";
export { registerCausalNode, addCausalEdge, resolveImpactScope } from "./core/_use-cases";
export type {
  ICausalNodeRepository,
  ICausalEdgeRepository,
  ICausalPathQuery,
} from "./domain.causal-graph/_ports";
