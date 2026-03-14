# work.module — File Index

**Bounded Context**: 工作項目 / Work Items
**職責**: 工作項目（issue/task）的 CRUD、狀態流轉、優先級管理、里程碑、依賴關係。
**不包含**: 排班/指派（workforce.module）、檔案附件（file.module）、WBS 規劃（workspace.module）。

> **最後更新**: Waves 38–41 (createWorkItem dialog, updateWorkItem inline edit, deleteWorkItem)

---

## `index.ts`
**描述**: 公開 API barrel — 匯出 DTOs、用例函數及 Port 介面。
**函數清單**:
- `export type WorkItemDTO` — 工作項目公開 DTO（含 `description?`）
- `export type UpdateWorkItemInput` — 更新輸入型別
- `export createWorkItem` — 建立工作項目
- `export updateWorkItem` — 更新工作項目（Wave 39 新增）
- `export updateWorkItemStatus` — 更新工作項目狀態
- `export deleteWorkItem` — 刪除工作項目（Wave 41 新增）
- `export getWorkItemsByWorkspace` — 依工作空間查詢工作項目
- `export type IWorkItemRepository` — 工作項目 Repository Port 介面
- `export type IMilestoneRepository` — 里程碑 Repository Port 介面

---

## `core/_use-cases.ts`
**描述**: 工作項目生命週期管理用例（open→in-progress→blocked→closed）。Wave 38-41 擴充 CRUD 完整性。
**函數清單**:
- `interface WorkItemDTO` — 工作項目公開 DTO（id, workspaceId, title, **description?**, status, priority, assigneeId, dueDate?, createdAt）
- `interface UpdateWorkItemInput` — 更新輸入（title?, description?, status?, priority?, assigneeId?|null, dueDate?|null）
- `updateWorkItem(repo, id, input): Promise<Result<WorkItemDTO>>` — 部分更新工作項目（Wave 39）
- `createWorkItem(repo, id, workspaceId, title, priority): Promise<Result<WorkItemDTO>>` — 建立工作項目（Wave 38 – 已有）
- `updateWorkItemStatus(repo, id, status): Promise<Result<WorkItemDTO>>` — 狀態流轉
- `getWorkItemsByWorkspace(repo, workspaceId): Promise<Result<WorkItemDTO[]>>` — 查詢清單
- `deleteWorkItem(repo, workspaceId, workItemId): Promise<Result<void>>` — 刪除（含所有權驗證）（Wave 41）

---

## `core/_actions.ts`
**描述**: `'use server'` 薄包裝層，重新匯出寫入型用例。
**函數清單**:
- 重新匯出 `WorkItemDTO`, `UpdateWorkItemInput`（型別）
- 重新匯出 `createWorkItem`、`updateWorkItem`、`updateWorkItemStatus`、`deleteWorkItem`

---

## `core/_queries.ts`
**描述**: 伺服器端唯讀查詢重新匯出。
**函數清單**:
- 重新匯出 `WorkItemDTO`（型別）
- 重新匯出 `getWorkItemsByWorkspace`

---

## `domain.work/_value-objects.ts`
**描述**: 工作項目 domain 的 Branded Types。
**函數清單**:
- `WorkItemIdSchema` / `type WorkItemId` — 工作項目唯一識別碼
- `MilestoneIdSchema` / `type MilestoneId` — 里程碑唯一識別碼
- `WorkItemStatusSchema` / `type WorkItemStatus` — enum: `"open"|"in-progress"|"blocked"|"closed"`
- `WorkItemPrioritySchema` / `type WorkItemPriority` — enum: `"low"|"medium"|"high"|"critical"`
- `DependencyTypeSchema` / `type DependencyType` — enum: `"blocks"|"depends-on"`

---

## `domain.work/_entity.ts`
**描述**: `WorkItemEntity` 及 `MilestoneEntity` Aggregate Roots。
**不變式**:
- 有 BLOCKS 依賴的工作項目不可直接關閉（須先解除依賴）
- CLOSED 工作項目不可再更改狀態
**函數清單**:
- `interface WorkDependency` — 工作依賴關係（fromId, toId, type）
- `interface WorkItemEntity` — Aggregate Root（id, workspaceId, title, status, priority, assigneeId, milestoneId, dependencies, tags, createdAt）
- `interface MilestoneEntity` — 里程碑記錄（id, workspaceId, title, dueAt, completedAt）
- `buildWorkItem(params, now): WorkItemEntity` — 建立工作項目 entity

---

## `domain.work/_events.ts`
**描述**: Work Bounded Context 的 Domain Event 型別定義。
**函數清單**:
- `interface WorkItemCreated` — 工作項目建立事件
- `interface WorkItemStatusChanged` — 狀態變更事件（含前後狀態）
- `type WorkDomainEventUnion` — 上述事件的 union type

---

## `domain.work/_ports.ts`
**描述**: Work domain 的 Port 介面定義。
**函數清單**:
- `interface IWorkItemRepository` — 工作項目持久化（findById, findByWorkspace, save, delete）
- `interface IMilestoneRepository` — 里程碑持久化（findById, findByWorkspace, save）

---

## `domain.work/_service.ts`
**描述**: Work Domain Service — 純函數，無 I/O。DependencyGraphValidationService（DAG 循環偵測）+ MilestoneProgressCalculationService（里程碑完成率）。
**函數清單**:
- `detectDependencyCycle(adjacency, newSourceId, newTargetId): boolean` — DFS 偵測新增依賴邊是否形成循環
- `getBlockingItems(items, blockedId): WorkItemId[]` — 回傳所有 blocks 指定 item 的 WorkItemId 陣列
- `calculateMilestoneProgress(items): number` — 計算 closed 工作項目百分比（0–100）

---

## `infra.firestore/_mapper.ts`
**描述**: Firestore 文件 ↔ WorkItemEntity / MilestoneEntity 的雙向轉換（Wave 11 實作）。
**函數清單**:
- `interface WorkDependencyDoc` — 依賴關係 Firestore 文件格式
- `interface WorkItemDoc` — WorkItem Firestore 文件格式
- `interface MilestoneDoc` — Milestone Firestore 文件格式
- `workItemDocToEntity(d): WorkItemEntity` — Firestore → WorkItemEntity
- `workItemEntityToDoc(e): WorkItemDoc` — WorkItemEntity → Firestore
- `milestoneDocToEntity(d): MilestoneEntity` — Firestore → MilestoneEntity
- `milestoneEntityToDoc(e): MilestoneDoc` — MilestoneEntity → Firestore

---

## `infra.firestore/_repository.ts`
**描述**: `IWorkItemRepository` 及 `IMilestoneRepository` 的 Firestore 實作（Wave 11 實作，使用 Client SDK）。
**函數清單**:
- `class FirestoreWorkItemRepository` — 實作 `IWorkItemRepository`（findById, findByWorkspaceId, save, deleteById）
- `class FirestoreMilestoneRepository` — 實作 `IMilestoneRepository`（findById, findByWorkspaceId, save）
