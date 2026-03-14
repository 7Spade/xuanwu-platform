# workspace.module — File Index

**Bounded Context**: 工作空間 / Workspace
**職責**: 專案規劃、WBS 工作分解、範圍定義、存取控制（"誰可以進入"）、生命週期管理。
**不包含**: 排班/指派（由 workforce.module 負責）、工作項目細節（由 work.module 負責）。

---

## `index.ts`
**描述**: 公開 API barrel — 匯出 DTOs、用例函數及 Port 介面。
**函數清單**:
- `export type WorkspaceDTO` — 工作空間公開 DTO
- `export type WorkspaceGrantDTO` — 存取授權 DTO
- `export createWorkspace` — 建立新工作空間
- `export getWorkspaceById` — 依 ID 取得工作空間
- `export getWorkspacesByDimension` — 依維度（命名空間/負責人）查詢工作空間列表
- `export advanceWorkspaceLifecycle` — 推進工作空間生命週期
- `export filterVisibleWorkspaces` — 依存取權限過濾可見工作空間
- `export type IWorkspaceRepository` — 工作空間 Repository Port 介面
- `export type IWorkspaceGrantRepository` — 授權 Repository Port 介面

---

## `core/_use-cases.ts`
**描述**: 工作空間 CRUD 及生命週期管理用例，包含 WBS 任務的讀寫。
**函數清單**:
- `interface WorkspaceDTO` — 工作空間完整 DTO（含生命週期、grant 列表、任務快照）
- `interface WorkspaceGrantDTO` — 存取授權 DTO（accountId/teamId, role）
- `createWorkspace(repo, grantRepo, params): Promise<Result<WorkspaceDTO>>` — 建立工作空間並賦予建立者 Manager 權限
- `getWorkspaceById(repo, id): Promise<Result<WorkspaceDTO | null>>` — 依 ID 查詢
- `getWorkspacesByDimension(repo, dimension): Promise<Result<WorkspaceDTO[]>>` — 依命名空間/負責人查詢清單
- `advanceWorkspaceLifecycle(repo, id, next): Promise<Result<WorkspaceDTO>>` — 狀態機推進（preparatory→active→stopped）
- `filterVisibleWorkspaces(workspaces, accountId, teamIds): WorkspaceDTO[]` — 純函數：依存取權過濾

---

## `core/_actions.ts`
**描述**: `'use server'` 薄包裝層，重新匯出寫入型用例。
**函數清單**:
- 重新匯出 `WorkspaceDTO`、`WorkspaceGrantDTO`（型別）
- 重新匯出 `createWorkspace`、`advanceWorkspaceLifecycle`

---

## `core/_queries.ts`
**描述**: 伺服器端唯讀查詢重新匯出。
**函數清單**:
- 重新匯出 `WorkspaceDTO`、`WorkspaceGrantDTO`（型別）
- 重新匯出 `getWorkspaceById`、`getWorkspacesByDimension`、`filterVisibleWorkspaces`

---

## `domain.workspace/_value-objects.ts`
**描述**: 工作空間 domain 的 Branded Types。
**函數清單**:
- `WorkspaceIdSchema` / `type WorkspaceId` — 工作空間唯一識別碼
- `WorkspaceSlugSchema` / `type WorkspaceSlug` — URL slug（小寫英數字、連字號）
- `WorkspaceLifecycleStateSchema` / `type WorkspaceLifecycleState` — enum: `"preparatory"|"active"|"stopped"`
- `WorkspaceVisibilitySchema` / `type WorkspaceVisibility` — enum: `"visible"|"hidden"`
- `WorkspaceRoleSchema` / `type WorkspaceRole` — enum: `"Manager"|"Contributor"|"Viewer"`
- `TaskStateSchema` / `type TaskState` — 任務狀態 enum（`"open"|"in-progress"|"done"|"cancelled"`）
- `TaskPrioritySchema` / `type TaskPriority` — 任務優先級 enum（`"low"|"medium"|"high"`）

---

## `domain.workspace/_entity.ts`
**描述**: `WorkspaceEntity` Aggregate Root，包含存取授權與 WBS 任務快照。
**不變式**:
- 狀態機：preparatory → active → stopped（不可逆）
- 建立者自動取得 Manager 角色
**函數清單**:
- `interface WorkspaceGrant` — 存取授權記錄（subjectId, subjectType, role）
- `interface WorkspaceLocation` — 實體/線上地點資訊
- `interface WorkspacePersonnel` — 人員角色快照（ownerId, managerId）
- `interface WorkspaceAddress` — 地址結構
- `interface WorkspaceTask` — WBS 任務快照（id, title, state, priority, assigneeId）
- `interface WorkspaceEntity` — Aggregate Root 結構
- `hasDirectGrant(entity, accountId, role): boolean` — 檢查帳號直接授權
- `hasTeamGrant(entity, teamIds, role): boolean` — 檢查團隊授權
- `hasWorkspaceAccess(entity, accountId, teamIds, role): boolean` — 綜合存取檢查
- `buildWorkspace(params, now): WorkspaceEntity` — Aggregate factory

---

## `domain.workspace/_events.ts`
**描述**: Workspace Bounded Context 的 Domain Event 型別定義。
**函數清單**:
- `interface WorkspaceCreated` — 工作空間建立事件
- `interface WorkspaceLifecycleChanged` — 生命週期狀態變更事件
- `interface WorkspaceGranted` — 存取授權新增事件
- `interface WorkspaceGrantRevoked` — 存取授權撤銷事件
- `interface TaskStateChanged` — WBS 任務狀態變更事件
- `interface TaskCreated` — WBS 任務建立事件
- `type WorkspaceDomainEventUnion` — 上述事件的 union type

---

## `domain.workspace/_ports.ts`
**描述**: Workspace domain 的 Port 介面定義。
**函數清單**:
- `interface IWorkspaceRepository` — 工作空間持久化（findById, findBySlug, findByDimension, save）
- `interface IWorkspaceGrantRepository` — 存取授權持久化（findByWorkspace, save, delete）

---

## `domain.workspace/_service.ts`
**描述**: Workspace Domain Service 規格說明。
**函數清單**:
- `WorkspaceAccessService`（描述）— 批量存取控制規則評估
- `WorkspaceArchiveService`（描述）— 工作空間歸檔（stopped 狀態後的清理邏輯）

---

## `infra.firestore/_repository.ts`
**描述**: `IWorkspaceRepository` 及 `IWorkspaceGrantRepository` 的 Firestore 實作骨架。
**函數清單**: *(待實作，目前為佔位註解)*

---

## `infra.firestore/_mapper.ts`
**描述**: Firestore 文件 ↔ WorkspaceEntity 的雙向轉換。
**函數清單**: *(待實作，目前為佔位註解)*
