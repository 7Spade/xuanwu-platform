// Causal-graph domain services.
// CausalPathResolutionService — traverses CausalNodes and CausalEdges via BFS/DFS
//   to compute a CausalPath from a root cause to all reachable effects.
//   Pure function over pre-loaded node/edge sets.
// ImpactScopeService — determines which downstream CausalNodes are affected by a
//   given trigger node, bounded by maxDepth. Returns an ImpactScope value object.
