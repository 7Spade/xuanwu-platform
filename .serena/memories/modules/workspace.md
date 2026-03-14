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
**描述**: Workspace Domain Services — 純函數，跨多個 Workspace aggregate 的業務規則。Wave 10 實作。
**函數清單**:
- `isWorkspaceVisibleToUser(workspace, userId, userTeamIds): boolean` — 依 visibility 設定與存取授權決定工作空間是否可見
- `filterVisibleWorkspaces(workspaces, userId, dimensionId, isOwnerOfDimension, accountType, userTeamIds): WorkspaceEntity[]` — 批量過濾：個人帳號全見；組織帳號依 owner 角色與 visibility 過濾
- `interface TaskWithChildren` — 擴展 WorkspaceTask，含 `children`, `descendantSum`, `wbsNo`, `progress`
- `buildTaskTree(tasks: WorkspaceTask[]): TaskWithChildren[]` — WBS 樹狀建構（循環偵測、WBS 編號、加權進度計算）

---

## `infra.firestore/_repository.ts`
**描述**: `IWorkspaceRepository` 及 `IWorkspaceGrantRepository` 的 Firestore 實作。Wave 10 實作。
**函數清單**:
- `class FirestoreWorkspaceRepository` — implements `IWorkspaceRepository`
  - `findById(id): Promise<WorkspaceEntity | null>`
  - `findByDimensionId(dimensionId): Promise<WorkspaceEntity[]>`
  - `save(workspace): Promise<void>`
  - `deleteById(id): Promise<void>`
- `class FirestoreWorkspaceGrantRepository` — implements `IWorkspaceGrantRepository`
  - `findByWorkspaceId(workspaceId): Promise<WorkspaceGrant[]>`
  - `addGrant(workspaceId, grant): Promise<void>`
  - `revokeGrant(workspaceId, grantId, now): Promise<void>`
  - `updateRole(workspaceId, grantId, newRole): Promise<void>`

---

## `infra.firestore/_mapper.ts`
**描述**: Firestore 文件 ↔ WorkspaceEntity 的雙向轉換，含所有子文件型別。Wave 10 實作。
**函數清單**:
- `interface WorkspaceDoc` — 原始 Firestore 文件結構
- `interface WorkspaceGrantDoc` — 授權子文件
- `interface WorkspaceLocationDoc` — 地點子文件
- `interface WorkspacePersonnelDoc` — 人員角色子文件
- `interface WorkspaceAddressDoc` — 地址子文件
- `interface WorkspaceTaskDoc` — WBS 任務子文件
- `workspaceDocToEntity(doc): WorkspaceEntity` — Firestore → domain
- `workspaceEntityToDoc(entity): WorkspaceDoc` — domain → Firestore

---

## `_components/shell/nav-main.tsx` *(Wave 18 — 新增)*
**描述**: 主導航選單 — 首頁與工作空間連結。使用 `usePathname` 高亮目前路由。
**Export**: `NavMain` (no props — reads pathname internally)

## `_components/shell/nav-user.tsx` *(Wave 18, updated Wave 22)*
**描述**: 認證用戶選單（側邊欄底部）。顯示用戶頭像、名稱、登出選項。
**架構注意**: Wave 22 起改用 `useCurrentAccount()` 從 `AccountProvider` 取得 auth + 帳號資料，不再直接訂閱 Firebase Auth。
**Export**: `NavUser` (no props)

## `_components/shell/dashboard-sidebar.tsx` *(Wave 18 — 新增)*
**描述**: 主側邊欄組合元件。使用 design system Sidebar 元件組裝 NavMain + NavUser。
**Export**: `DashboardSidebar` (no props)

## `_components/shell/shell-header.tsx` *(Wave 18 — 新增)*
**描述**: 認證頁面頂部導覽列。包含 SidebarTrigger、麵包屑導航（支援 i18n）。
**Export**: `ShellHeader` (no props)

## `_components/workspaces-view.tsx` *(Wave 19, updated Wave 22)*
**描述**: 工作空間列表頁面容器。Wave 22 起透過 `useWorkspaces(account?.id)` 自行從 Firestore 抓取資料，無需 server 傳入 props。含 loading/error 狀態處理。
**Export**: `WorkspacesView` — 用於 `app/(main)/[slug]/workspaces/page.tsx`

## `_components/workspace-card.tsx` *(Wave 19)*
**描述**: 單一工作空間卡片 UI。顯示名稱、狀態、成員數；支援 grid/list 切換檢視。
**Export**: `WorkspaceCard({ workspace })`

## `_components/workspace-settings-view.tsx` *(Wave 20)*
**描述**: 組織通用設定頁（`/[slug]/settings/general`）— 工作空間名稱/描述 form shell。
**Export**: `WorkspaceSettingsView` — 用於 `app/(main)/[slug]/settings/general/page.tsx`

## `_components/members-settings-view.tsx` *(Wave 26)*
**描述**: 成員管理設定頁，自行取得 Firestore 資料 via `useMembers(slug)`。載入中 → 成員列表（`MemberRow`）→ 空狀態。
**Export**: `MembersSettingsView` — 用於 `app/(main)/[slug]/settings/members/page.tsx`

## `_components/use-members.ts` *(Wave 26)*
**描述**: Client-side React hook。透過 `FirestoreAccountRepository.findByHandle(slug)` 取得 org 成員清單（`AccountEntity.members[]`）。回傳 `{ members, loading, error, refresh }`。
**Export**: `useMembers(slug: string | null | undefined)`

## `_components/member-row.tsx` *(Wave 26)*
**描述**: 單一成員列，顯示 accountId（前12碼）、role Badge、status Badge、邀請日期。role/status i18n keys (`settings.members.role.*` / `settings.members.status.*`)。
**Export**: `MemberRow` — 用於 `MembersSettingsView`

## `_components/wbs-view.tsx` *(Wave 25)*
**描述**: WBS 任務清單，自行取得 Firestore 資料 via `useWorkItems(workspaceId)`。載入中 → 任務列表（`WorkItemRow`）→ 空狀態。
**Export**: `WbsView` — 用於 `app/(main)/[slug]/[workspaceId]/(workspace)/wbs/page.tsx`

## `_components/use-work-items.ts` *(Wave 25)*
**描述**: Client-side React hook。透過 `FirestoreWorkItemRepository.findByWorkspaceId(workspaceId)` 取得任務清單。回傳 `{ items, loading, error, refresh }`，依 createdAt 降冪排序。
**Export**: `useWorkItems(workspaceId: string | null | undefined)`

## `_components/work-item-row.tsx` *(Wave 25)*
**描述**: 單一工作項目列，顯示狀態 Badge、優先度色點、標題、到期日。status.* i18n keys (`wbs.status.open/in-progress/blocked/closed`)。
**Export**: `WorkItemRow` — 用於 `WbsView`

## `_components/editor-view.tsx` *(Wave 21)*
**描述**: 獨立編輯器 shell（`/[slug]/[workspaceId]/editor`）— 文件編輯框架（Wave 25 接資料）。
**Export**: `EditorView` — 用於 `app/(main)/[slug]/[workspaceId]/(standalone)/editor/page.tsx`

## `_components/use-workspaces.ts` *(Wave 22)*
**描述**: Client-side React hook。透過 `FirestoreWorkspaceRepository.findByDimensionId(dimensionId)` 取得工作空間清單。回傳 `{ workspaces, loading, error, refresh }`。
**Export**: `useWorkspaces(dimensionId: string | null | undefined)`
