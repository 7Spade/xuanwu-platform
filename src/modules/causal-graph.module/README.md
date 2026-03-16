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

## Domain Governance（必填）

### 1. 上下文邊界（Bounded Context）
- 本模組邊界：**Causal Graph / 因果分析與影響路徑**。
- 僅允許透過 `src/modules/causal-graph.module/index.ts` 對外暴露能力；禁止跨模組直連 `core/`、`domain.*`、`infra.*`、`_components/`。

### 2. 核心域與支撐域識別
- 本模組定位：**支撐域**。
- 核心能力放在 `domain.*` + `core/`；跨域整合、通知、搜尋等配套能力視為支撐能力，由應用層編排。

### 3. 上下文映射（Context Mapping）
- 主要上下游關聯：**Workspace、Search、Audit**。
- 跨上下文資料交換需使用 DTO／事件，不共享對方內部實體。

### 4. 防腐層（Anti-Corruption Layer）
- 外部系統（Firebase / Upstash / 外部 API）必須封裝在 `infra.*`。
- 使用 Mapper / Adapter 將外部資料格式轉換為本域 Value Object 與 Entity，避免污染領域模型。

### 5. 核心業務邏輯
- 不變條件（invariants）與規則放在 `domain.*`（Entity / VO / Domain Service）。
- `core/_use-cases.ts` 僅做流程協調：載入 → 套用規則 → 透過 Port 持久化 → 發布事件。

### 6. 操作流程
1. Presentation（`_components/` 或 `src/app`）呼叫模組公開 Action/Query。
2. Application（`core/`）執行用例並調用 Domain。
3. Domain 計算狀態變更與事件。
4. Infrastructure（`infra.*`）透過 Port 落地 I/O。

### 7. 模組間契約
- 同步契約：`index.ts` 匯出的 Action / Query / DTO。
- 非同步契約：Domain Event payload（版本化、向後相容）。
- 契約變更需先更新 README 與呼叫端，避免破壞既有流程。
