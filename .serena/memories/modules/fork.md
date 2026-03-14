# fork.module — File Index

**Bounded Context**: 分叉 / Fork
**職責**: Workspace 分叉（分支）的建立、狀態管理（active/merged/abandoned）、分叉關係追蹤。
**類比**: 類似 GitHub 的 fork 機制，但作用於 Workspace 而非 repository。
**不包含**: 工作空間業務邏輯（workspace.module）、合併衝突解析（future infra）。

---

## `index.ts`
**描述**: 公開 API barrel — 匯出 DTOs、用例函數及 Port 介面。
**函數清單**:
- `export type ForkDTO` — 分叉公開 DTO
- `export forkWorkspace` — 建立工作空間分叉
- `export abandonFork` — 廢棄分叉（active→abandoned）
- `export getForksByAccount` — 查詢帳號的分叉清單
- `export type IForkRepository` — 分叉 Repository Port 介面

---

## `core/_use-cases.ts`
**描述**: 分叉生命週期管理用例（active→merged/abandoned）。
**函數清單**:
- `interface ForkDTO` — 分叉公開 DTO（id, sourceWorkspaceId, forkWorkspaceId, createdByAccountId, status, createdAt）
- `forkWorkspace(repo, sourceWorkspaceId, createdByAccountId): Promise<Result<ForkDTO>>` — 建立分叉（status: active）
- `abandonFork(repo, forkId): Promise<Result<ForkDTO>>` — 廢棄分叉（active→abandoned）
- `getForksByAccount(repo, accountId): Promise<Result<ForkDTO[]>>` — 查詢帳號建立的分叉清單

---

## `core/_actions.ts`
**描述**: `'use server'` 薄包裝層，重新匯出寫入型用例。
**函數清單**:
- 重新匯出 `ForkDTO`（型別）
- 重新匯出 `forkWorkspace`、`abandonFork`

---

## `core/_queries.ts`
**描述**: 伺服器端唯讀查詢重新匯出。
**函數清單**:
- 重新匯出 `ForkDTO`（型別）
- 重新匯出 `getForksByAccount`

---

## `domain.fork/_value-objects.ts`
**描述**: 分叉 domain 的 Branded Types。
**函數清單**:
- `ForkIdSchema` / `type ForkId` — 分叉唯一識別碼
- `ForkStatusSchema` / `type ForkStatus` — 分叉狀態 enum: `"active"|"merged"|"abandoned"`

---

## `domain.fork/_entity.ts`
**描述**: `ForkEntity` 分叉關係記錄。
**不變式**:
- 只有 `active` 狀態的分叉可被廢棄或合併
**函數清單**:
- `interface ForkEntity` — 分叉記錄（id, sourceWorkspaceId, forkWorkspaceId, createdByAccountId, status, createdAt）
- `buildFork(params, now): ForkEntity` — 建立 active 狀態的分叉 entity

---

## `domain.fork/_events.ts`
**描述**: Fork Bounded Context 的 Domain Event 型別定義。
**函數清單**:
- `interface WorkspaceForked` — 工作空間分叉建立事件（sourceWorkspaceId, forkWorkspaceId, createdByAccountId）
- `interface ForkAbandoned` — 分叉廢棄事件（forkId）
- `type ForkDomainEventUnion` — 上述事件的 union type

---

## `domain.fork/_ports.ts`
**描述**: Fork domain 的 Port 介面定義。
**函數清單**:
- `interface IForkRepository` — 分叉記錄持久化（findById, findBySource, findByAccount, save）

---

## `domain.fork/_service.ts`
**描述**: Fork Domain Service 規格說明。
**函數清單**:
- `ForkMergeService`（描述）— 分叉合併邏輯（active→merged，需協調 workspace.module）
- `ForkDiffService`（描述）— 計算分叉與來源工作空間之間的差異

---

## `infra.firestore/_repository.ts`
**描述**: `IForkRepository` 的 Firestore 實作骨架。
**函數清單**: *(待實作，目前為佔位註解)*

---

## `infra.firestore/_mapper.ts`
**描述**: Firestore 文件 ↔ ForkEntity 的雙向轉換。
**函數清單**: *(待實作，目前為佔位註解)*
