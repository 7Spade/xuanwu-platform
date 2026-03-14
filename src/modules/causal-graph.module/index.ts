// causal-graph.module — Public API barrel
// Bounded Context: Causal Graph · Impact Analysis / 因果圖 · 影響分析
// Layer: SaaS / Workspace (cross-cutting analytical)
//
// causal-graph.module provides:
//   - CausalNode registry: domain entities and events that participate in causal chains
//   - CausalEdge management: directed cause→effect relationships between nodes
//   - Impact scope resolution: given a trigger node, return the full downstream effect set
//   - CausalPath query: trace the full chain from root cause to terminal effect
//
// Distinction from work.module (Dependency):
//   - Task ordering / scheduling dependency (A before B) → work.module owns Dependency VO
//   - Analytical cause-effect reasoning across domain events and BCs → causal-graph.module
//
// Relationship to other modules:
//   - All source modules: domain events feed CausalNode updates (via EventBus)
//   - work.module: WorkItem and Milestone are common CausalNode sources
//   - workspace.module: CR / QA / Baseline state changes feed causal edges
//   - search.module: CausalPath entries indexed for cross-BC impact search
//   - audit.module: CausalEdgeAdded events projected as immutable audit entries
//
// Re-export DTOs, actions, and queries as they are implemented.
// NEVER export entities, value objects, repositories, or domain events.
export {};
