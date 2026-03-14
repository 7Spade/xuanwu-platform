# causal-graph.module

**Bounded Context:** Causal Graph · Impact Analysis / 因果圖 · 影響分析  
**Layer:** SaaS / Workspace (cross-cutting analytical)

## Purpose

`causal-graph.module` models **cause-effect relationships between domain events and entities**
across bounded contexts. It answers questions like:

- "What downstream work items are affected if this milestone slips?"
- "Which workspace events contributed to this settlement discrepancy?"
- "What is the full impact chain of approving this Change Request?"

> **Key distinction from `work.module` (Dependency):**  
> `work.module` owns *task ordering dependencies* (A must complete before B — scheduling).  
> `causal-graph.module` models *analytical cause-effect relationships* across domain events
> (why did X happen? what does X cause?), including cross-module causal chains.

## What this module owns

| Concern | Description |
|---------|-------------|
| CausalNode | A domain entity or event that participates in a causal relationship |
| CausalEdge | A directed cause→effect relationship between two CausalNodes |
| CausalPath | A resolved chain of causal edges from root cause to terminal effect |
| ImpactScope | Set of CausalNodes reachable from a given trigger node |

## What this module does NOT own

| Concern | Correct module |
|---------|----------------|
| Task ordering / scheduling dependency | `work.module` (Dependency value object) |
| Audit history of who did what | `audit.module` (AuditEntry) |
| Work item status transitions | `work.module` (WorkItem entity) |

## Cross-module dependencies

| Module | Direction | Reason |
|--------|-----------|--------|
| All source modules | ← | Domain events feed CausalNode updates |
| `work.module` | → | WorkItem and Milestone are common CausalNode sources |
| `workspace.module` | → | CR / QA / Baseline state changes feed causal edges |
| `search.module` | ← | CausalPath entries indexed for cross-BC impact search |

## Standard 4-layer structure

```
causal-graph.module/
├── index.ts
├── domain.causal-graph/
│   ├── _entity.ts               # CausalNode · CausalEdge · CausalPath
│   ├── _value-objects.ts        # CausalNodeId · EdgeWeight · CausalDirection · ImpactScope
│   ├── _ports.ts                # ICausalNodeRepository · ICausalEdgeRepository · ICausalPathQuery
│   └── _events.ts               # CausalEdgeAdded · ImpactScopeResolved
├── core/
│   ├── _use-cases.ts            # AddCausalEdgeUseCase · ResolveImpactScopeUseCase · QueryCausalPathUseCase
│   ├── _actions.ts
│   └── _queries.ts
├── infra.firestore/
│   ├── _repository.ts
│   └── _mapper.ts
└── _components/
```
