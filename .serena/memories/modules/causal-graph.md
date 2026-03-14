# causal-graph.module — File Index

**Bounded Context**: 因果圖 / Causal Graph
**職責**: 因果關係節點與邊的管理、影響範圍分析（向上游/下游追蹤）、路徑解析。
**用途**: 用於根因分析（Root Cause Analysis）、變更影響評估、依賴可視化。
**不包含**: 工作項目依賴（work.module）、知識圖譜（future infra）。

---

## `index.ts`
**描述**: 公開 API barrel — 匯出 DTOs、用例函數及 Port 介面。
**函數清單**:
- `export type CausalNodeDTO` — 因果節點公開 DTO
- `export type ImpactScopeDTO` — 影響範圍分析結果 DTO
- `export registerCausalNode` — 註冊新因果節點
- `export addCausalEdge` — 新增因果邊（建立因果關係）
- `export resolveImpactScope` — 解析節點的影響範圍（upstream/downstream/both）
- `export type ICausalNodeRepository` — 節點 Repository Port 介面
- `export type ICausalEdgeRepository` — 邊 Repository Port 介面
- `export type ICausalPathQuery` — 路徑查詢 Port 介面

---

## `core/_use-cases.ts`
**描述**: 因果圖節點/邊管理與影響範圍分析用例。
**函數清單**:
- `interface CausalNodeDTO` — 因果節點 DTO（id, kind, label, workspaceId, metadata）
- `interface ImpactScopeDTO` — 影響範圍 DTO（rootNodeId, direction, affectedNodeIds, depth）
- `registerCausalNode(repo, params): Promise<Result<CausalNodeDTO>>` — 建立新節點
- `addCausalEdge(edgeRepo, fromNodeId, toNodeId, label): Promise<Result<void>>` — 新增有向邊
- `resolveImpactScope(pathQuery, nodeId, direction, maxDepth): Promise<Result<ImpactScopeDTO>>` — 計算影響範圍（BFS/DFS 遍歷）

---

## `core/_actions.ts`
**描述**: `'use server'` 薄包裝層，重新匯出寫入型用例。
**函數清單**:
- 重新匯出 `CausalNodeDTO`、`ImpactScopeDTO`（型別）
- 重新匯出 `registerCausalNode`、`addCausalEdge`

---

## `core/_queries.ts`
**描述**: 伺服器端唯讀查詢重新匯出。
**函數清單**:
- 重新匯出 `CausalNodeDTO`、`ImpactScopeDTO`（型別）
- 重新匯出 `resolveImpactScope`

---

## `domain.causal-graph/_value-objects.ts`
**描述**: 因果圖 domain 的 Value Objects 與輔助結構。
**函數清單**:
- `interface ImpactScope` — 影響範圍結構（rootNodeId, direction, affectedNodeIds, depth）
- `type CausalDirection` — 遍歷方向: `'upstream' | 'downstream' | 'both'`

---

## `domain.causal-graph/_entity.ts`
**描述**: 因果圖核心 entity 結構定義（節點、邊、路徑）。
**函數清單**:
- `type CausalNodeId` — 節點 ID 型別別名
- `type CausalNodeKind` — 節點種類（risk/action/outcome/event 等）
- `interface CausalNode` — 節點結構（id, kind, label, workspaceId, metadata, createdAt）
- `interface CausalEdge` — 有向邊結構（id, fromNodeId, toNodeId, label, strength, createdAt）
- `interface CausalPath` — 路徑記錄（nodeIds: 有序節點 ID 陣列）

---

## `domain.causal-graph/_events.ts`
**描述**: CausalGraph Bounded Context 的 Domain Event 型別定義。
**函數清單**:
- `interface CausalEdgeAdded` — 因果邊新增事件
- `interface ImpactScopeResolved` — 影響範圍計算完成事件
- `type CausalGraphDomainEvent` — 上述事件的 union type

---

## `domain.causal-graph/_ports.ts`
**描述**: CausalGraph domain 的 Port 介面定義。
**函數清單**:
- `interface ICausalNodeRepository` — 節點持久化（findById, findByWorkspace, save）
- `interface ICausalEdgeRepository` — 邊持久化（findByFromNode, findByToNode, save）
- `interface ICausalPathQuery` — 路徑遍歷查詢（traverseImpact: BFS/DFS 返回受影響節點 ID 列表）

---

## `domain.causal-graph/_service.ts`
**描述**: CausalGraph Domain Service 規格說明。
**函數清單**:
- `CyclicDependencyDetector`（描述）— 偵測因果圖中的循環依賴
- `ImpactPropagationService`（描述）— 計算多跳影響傳播路徑

---

## `infra.firestore/_repository.ts`
**描述**: `ICausalNodeRepository` 及 `ICausalEdgeRepository` 的 Firestore 實作骨架。
**函數清單**: *(待實作，目前為佔位註解)*

---

## `infra.firestore/_mapper.ts`
**描述**: Firestore 文件 ↔ CausalNode / CausalEdge 的雙向轉換。
**函數清單**: *(待實作，目前為佔位註解)*
