# Architecture & Platform Issues / 架構與平台問題

> Tags: `issues` `architecture` `ddd` `backlog`  
> 所有開放與已解決的架構、領域設計、整合、效能、安全、UI 及文件問題之統一追蹤清單。  
> **維護者**：`xuanwu-quality` + `xuanwu-docs`

---

## 開放問題速覽 / Open Issues at a Glance

| ID | 類別 | 嚴重程度 | 摘要 |
|----|------|---------|------|
| 19 | 架構 | 🔴 高 | Presentation Layer 直接實例化 Infrastructure Repository（41 個元件） |
| 20 | 架構 | 🟡 中 | Presentation Layer 直接 import Domain Layer 型別（19 處） |
| 21 | 架構 | 🟡 中 | Module Public API 匯出 Presentation Layer 元件（5 個模組） |
| 22 | 架構 | 🟡 中 | Module Public API 匯出 Domain Layer 物件（workspace、work） |
| 23 | 架構 | 🔴 高 | workspace.module 跨模組直接存取 work.module / account.module 內部層 |
| 24 | 架構 | 🟡 中 | 跨模組 Presentation Layer 元件直接依賴（3 處） |
| 25 | 架構 | 🟡 中 | `useCurrentAccount` 跨模組 Presentation Hook 耦合（11 個元件） |
| INT-001 | 整合 | 🔴 高 | `IdentityRecord.accountId` 可為 null 導致競爭條件 |
| INT-002 | 整合 | 🔴 高 | `achievement.module` → `account.module` 跨 BC 直接依賴 |
| INT-003 | 整合 | 🟡 中 | `CausalNode.kind` 硬編碼跨模組實體名稱 |
| INT-004 | 整合 | 🔴 高 | Namespace-Account 同步機制缺乏明確整合合約 |
| INT-005 | 整合 | 🟡 中 | `SearchIndexEntry` 未定義索引建立觸發機制 |
| INT-006 | 整合 | 🟢 低 | `AuditEntry` 建立後無事件發布 |
| API-001 | API | 🔴 高 | `IAccountRepository.save()` 缺乏樂觀並發控制 |
| API-002 | API | 🟡 中 | `SearchIndexEntry.sourceModule` 使用 `string` 而非 union type |
| API-003 | API | 🟡 中 | `AuditEntry.actor.accountHandle` 洩漏表現層概念至不可變稽核記錄 |
| API-004 | API | 🔴 高 | `IAccountHandleAvailabilityPort` TOCTOU 競爭 |
| API-005 | API | 🟡 中 | `CausalNode.kind` 硬編碼跨模組類型字串 |
| API-006 | API | 🟢 低 | 模組公開 API 缺少版本標記 |
| SEC-002 | 安全 | 🟡 中 | `buildAuditEntry()` 預設 `outcome: "success"` |
| SEC-003 | 安全 | 🟡 中 | JWT Custom Claims 無文件化輪換策略 |
| SEC-004 | 安全 | 🟡 中 | `WorkspaceVisibility.hidden` 無存取控制語意強制 |
| SEC-005 | 安全 | 🔴 高 | `IAccountHandleAvailabilityPort` TOCTOU 競爭（見 API-004） |
| SEC-006 | 安全 | 🟢 低 | `SettlementRecord.contractAmount` 無上限約束 |
| SEC-007 | 安全 | 🔴 高 | Firestore Security Rules 未覆蓋實際使用的 Collections |
| PERF-001 | 效能 | 🔴 高 | `WorkspaceEntity.tasks` 無界嵌入集合 |
| PERF-002 | 效能 | 🟡 中 | `AccountEntity.members` 無界嵌入集合 |
| PERF-003 | 效能 | 🟡 中 | `CausalPath` 含無界 nodes/edges 陣列 |
| PERF-004 | 效能 | 🟢 低 | `NotificationRecord.data` 無大小約束 |
| PERF-005 | 效能 | 🟢 低 | `SearchIndexEntry.tags` 無界陣列 |
| FIELD-001 | 欄位 | 🔴 高 | 財務計算欄位混入 Work Domain |
| FIELD-002 | 欄位 | 🔴 高 | 三個不相容的 Location 結構體 |
| FIELD-003 | 欄位 | 🟡 中 | `ScheduleAssignment` 同時持有兩個 location 欄位 |
| FIELD-004 | 欄位 | 🟡 中 | `lineAmount` vs `subtotal` 同計算不同命名 |
| FIELD-005 | 欄位 | 🟢 低 | `WorkspaceTask.name` vs `WorkItemEntity.title` |
| FIELD-006 | 欄位 | 🟡 中 | `dimensionId` vs `accountId` 同義不同名 |
| FIELD-007 | 欄位 | 🟢 低 | `MembershipRecord` 時間欄位命名不一致 |
| WF-001 | 流程 | 🟡 中 | Settlement `stage` vs Workspace `lifecycleState` 語意不一致 |
| WF-002 | 流程 | �� 中 | Fork `status` 與 Workspace `lifecycleState` 缺乏耦合 |
| WF-003 | 流程 | 🟡 中 | Membership 邀請流程缺乏 Domain Service 描述 |
| WF-004 | 流程 | 🟢 低 | `ScheduleAssignment.originType` 自動化分支流程未定義 |
| WF-005 | 流程 | 🟢 低 | `SettlementRecord.cycleIndex` 遞增規則未在 Domain 層強制 |
| WF-006 | 流程 | 🟡 中 | 建立 Workspace 按鈕在未就緒時可點擊但無可見結果 |
| UI-001 | UI | 🟡 中 | `WorkspaceCapability.config?: object` 使 UI 渲染不可預測 |
| UI-002 | UI | 🟢 低 | `WorkspaceAddress` 對純數位空間過於龐大 |
| UI-003 | UI | 🟢 低 | `WorkspacePersonnel` 全部可選，UI 無法提供有效驗證提示 |
| UI-004 | UI | 🟡 中 | `NotificationRecord.data` 使通知 UI 無法靜態渲染 |
| UI-005 | UI | 🟡 中 | `WorkspaceTask` 嵌入 `WorkspaceEntity.tasks` 導致 WBS UI 無法分頁 |
| SEM-002 | 語意 | 🔴 高 | `WorkspaceTask` vs `WorkItemEntity` 語意重疊 |
| SEM-004 | 語意 | 🟡 中 | 單一 `assigneeId` vs 複數 `assigneeIds` 不一致 |
| DOC-009 | 文件 | 🟡 中 | `next-best-practices` skill 19 個 references 檔案不存在 |

---

## Part A: Architecture & DDD Issues / 架構與 DDD 問題

### Issue 19：Presentation Layer 直接實例化 Infrastructure Repository（41 個元件）

**受影響範圍：** 全部 14 個有 Firestore 操作的模組  
**嚴重程度：** 高（🔴）

#### 問題描述

元件（`_components/*.tsx`）和 hooks（`_components/use-*.ts`）直接 `new FirestoreXxxRepository()` 在 Presentation 層建立 Infrastructure Repository 實例，違反了 DDD 四層架構規範。

```typescript
// ❌ 在 Presentation Layer（React hook）實例化 Infrastructure
export function useWorkspace(id: string) {
  const repo = new FirestoreWorkspaceRepository();  // ← 直接實例化
  getWorkspaceById(repo, workspaceId); // use-case 本身正確，但 repo 由 Presentation 創建
}
```

#### 受影響檔案（依模組）

| 模組 | 違規檔案數 | 代表性違規路徑 |
|------|-----------|---------------|
| `workspace.module` | 23 | `use-workspace.ts`, `use-workspaces.ts`, `workspace-card.tsx`, `create-workspace-dialog.tsx`, `issues-view.tsx`, … |
| `workforce.module` | 2 | `use-workforce-schedules.ts`, `workforce-schedule-view.tsx` |
| `social.module` | 2 | `use-social-feed.ts`, `social-actions-bar.tsx` |
| `search.module` | 2 | `search-results-view.tsx`, `global-search-dialog.tsx` |
| `namespace.module` | 2 | `use-namespace.ts`, `use-namespace-by-slug.ts` |
| `collaboration.module` | 2 | `use-comments.ts`, `comment-thread.tsx` |
| `notification.module` | 1 | `use-notifications.ts` |
| `identity.module` | 1 | `use-api-keys.ts` |
| `fork.module` | 1 | `forks-view.tsx` |
| `file.module` | 1 | `use-files.ts` |
| `causal-graph.module` | 1 | `use-causal-graph.ts` |
| `audit.module` | 1 | `use-audit-log.ts` |
| `achievement.module` | 1 | `use-achievements.ts` |
| `account.module` | 1 | `account-provider.tsx` |

**合計：41 個元件檔案，遍及 14 個模組。**

#### 根本原因

缺少應用層的 Repository Factory 或依賴注入機制。Use-cases 的 Repository 參數設計是正確的，但目前沒有統一的位置在「正確的層次」建立 repository 實例，導致 Presentation 層填補了這個空缺。

#### 修正方向

**方案 A（推薦）：使用 React Context 提供 Repository 實例**

在 Application 層建立 `RepositoryProvider`，集中實例化所有 Firestore Repository，透過 Context 注入給 hooks 使用：

```typescript
// src/infrastructure/di/repository-context.tsx（Application/Infrastructure 邊界）
const WorkspaceRepositoryContext = createContext<IWorkspaceRepository | null>(null);

export function RepositoryProvider({ children }: { children: ReactNode }) {
  const workspaceRepo = useMemo(() => new FirestoreWorkspaceRepository(), []);
  // ...
  return (
    <WorkspaceRepositoryContext.Provider value={workspaceRepo}>
      {children}
    </WorkspaceRepositoryContext.Provider>
  );
}
```

**方案 B：在 Application 層包裝 use-cases**

為每個需要 repository 的 use-case 建立「有 repository 的版本」：

```typescript
// src/modules/workspace.module/core/_service.ts（Application 層）
import { FirestoreWorkspaceRepository } from "../infra.firestore/_repository"; // 只在此處允許

const defaultRepo = new FirestoreWorkspaceRepository();
export const getWorkspaceByIdService = (id: string) => getWorkspaceById(defaultRepo, id);
```

---

### Issue 20：Presentation Layer 直接 import Domain Layer 型別（19 處）

**受影響範圍：** `workspace.module`、`work.module`、`social.module`、`file.module`、`causal-graph.module`  
**嚴重程度：** 中（🟡）

元件直接從 `domain.*/` 層匯入 Value Object 型別、Entity 型別與 Domain Service 函數，而非透過 Application 層公開的 DTO。

#### 修正方向

1. 將 Value Object 型別提升至 DTO 定義中（`core/_use-cases.ts`），或在 Application 層建立對應的 union type。
2. 將 Domain Service 函數（`buildTaskTree`、`getMimeGroup`）包裝為 Application 層的 utility，並透過 DTO 或 Application hook 公開。
3. Entity 內嵌型別（`WorkspaceAddress`, `WorkspacePersonnel`）應改為 DTO 欄位，定義在 `core/_use-cases.ts` 的相關 DTO 中。

---

### Issue 21：Module Public API（`index.ts`）匯出 Presentation Layer 元件（5 個模組）

**嚴重程度：** 中（🟡）

以下模組的 `index.ts` 中直接 export `_components/` 的 React 元件與 hooks，違反「模組 Public API 只應匯出 DTO、Use-cases、Port 介面」的原則。

| 模組 | 在 `index.ts` 匯出的 Presentation 元件 |
|------|---------------------------------------|
| `workspace.module` | `useWorkspace`, `WorkspaceNavTabs`, `WorkspaceShell`, `WorkspaceStatusBar`, `WorkspaceCapabilitiesView`, `WorkspaceGrantsView`, `WorkspaceSettingsDialog` |
| `audit.module` | `AuditLogView`, `WorkspaceAuditView`, `useWorkspaceAuditLog`, `useResourceAuditLog` |
| `file.module` | `useFiles`, `FileItem`, `FilePreview` |
| `search.module` | `GlobalSearchDialog`, `SearchResultsView`, `SearchFilterBar`, `useSearchHistory` |
| `social.module` | `SocialActionsBar`, `SocialFeedView`, `SocialExploreView`, `FollowersPanel` |

#### 修正方向

從各模組的 `index.ts` 中移除所有 `_components/` 相關的 export。頁面（`src/app/`）與父元件應直接從 `@/modules/<name>.module/_components/<file>` import，而非透過 barrel。

---

### Issue 22：Module Public API 匯出 Domain Layer 物件（2 個模組）

**嚴重程度：** 中（🟡）

`workspace.module` 和 `work.module` 的 `index.ts` 暴露了 Domain Layer Entity 型別、Domain Service 函數與領域常數，讓其他模組可以繞過 Application 層直接使用 Domain 內部物件。

#### 修正方向

- `WorkspaceEntity` → 移除，使用者改用 `WorkspaceDTO`
- `hasWorkspaceAccess` → 封裝在 Application use-case 內，不直接暴露
- `CAPABILITY_SPECS` → 若外部需要，透過 Application 層 query 取得
- `buildTaskTree` → 包裝成 Application 層 utility（e.g. `getWorkItemTree(repo, workspaceId): Promise<TaskWithChildren[]>`）

---

### Issue 23：workspace.module 跨模組直接存取 work.module / account.module 內部層（6 個元件）

**嚴重程度：** 高（🔴）

`workspace.module` 的 `_components/` 有 6 個元件直接 import `work.module` 的 `infra.firestore/` 與 `domain.work/` 內部路徑，**完全繞過 `work.module` 的 `index.ts` Public API**。

#### 修正方向

1. 所有 `work.module` 相關的 use-case 呼叫應透過 `work.module` 的 `index.ts` 中公開的函數。
2. 在 `work.module/index.ts` 補充所有 workspace 需要的操作（`updateWorkItem`、`deleteWorkItem`、`createChildWorkItem`、`reportProgress`）。
3. Repository 實例化應移至 `work.module` 內部（透過服務層或 DI），不讓外部模組知道 `FirestoreWorkItemRepository` 的存在。

---

### Issue 24：跨模組 Presentation Layer 元件直接依賴（3 處）

**嚴重程度：** 中（🟡）

| 違規元件 | 直接 import 的跨模組元件 |
|---------|------------------------|
| `settlement.module/_components/billing-view.tsx:21` | `@/modules/namespace.module/_components/use-namespace-by-slug` |
| `workspace.module/_components/dashboard-view.tsx:26` | `@/modules/audit.module/_components/audit-log-view` |
| `workspace.module/_components/dashboard-view.tsx:27` | `@/modules/audit.module/_components/use-audit-log` |

#### 修正方向

1. **settlement → namespace**：在 `namespace.module/index.ts` 公開 `getNamespaceStats(slug)` query，`billing-view` 呼叫此 use-case 取得 `workspaceCount`。
2. **workspace → audit**：在 `dashboard-view` 的父層頁面組合 `DashboardView` 和 `AuditLogView`，或透過 React `children`/`slot` props 注入，切斷跨模組 Presentation 耦合。

---

### Issue 25：`useCurrentAccount` 跨模組 Presentation Hook 耦合（7 個模組）

**嚴重程度：** 中（🟡）（程式碼壞味道）

`useCurrentAccount()` hook 定義在 `account.module/_components/account-provider.tsx`，但有 11 個不同模組的 `_components/` 直接 import 它，造成 7 個模組與 `account.module` 的**內部** Presentation 層產生硬耦合。

#### 修正方向

在 `account.module/index.ts` 中補充穩定的公開介面：

```typescript
export { useCurrentAccount } from "./_components/account-provider";
export type { CurrentAccountState } from "./_components/account-provider";
```

> **更長遠的作法**：將 `CurrentAccount` 狀態提升到 `src/infrastructure/session/` 的 React Context，使其不屬於任何單一 Domain Module。

---

## Part B: Integration Issues / 整合問題

> 跨模組依賴、第三方服務整合、資料同步，以及模組邊界侵蝕問題。

### INT-001 `IdentityRecord.accountId` 可為 null 導致 Identity-Account 連結競爭條件

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 高（🔴） |
| **受影響模組** | `identity.module`, `account.module` |

**問題描述**  
`IdentityRecord.accountId` 在帳號完成建立前為 `null`。這產生一個可觀察的時間窗口：若 AccountEntity 建立失敗，`IdentityRecord.accountId` 永久為 null，且無冪等補建機制。

**建議修正方向**  
在 `identity.module` 的 Application Layer 定義 `provisionAccount()` use case，使用 Firestore Transaction 原子地建立 `IdentityRecord` 和 `AccountEntity`；或在 `onAuthStateChanged` 觸發時，始終檢查並補建缺失的 AccountEntity（idempotent 補建）。

---

### INT-002 `achievement.module` → `account.module` 的 Port 造成跨 BC 直接依賴

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 高（🔴） |
| **受影響模組** | `achievement.module`, `account.module` |

**問題描述**  
`account.module` 的 Domain Layer 定義了 `IAccountBadgeWritePort`，讓 `achievement.module` 可以直接調用以寫入 badge，造成 `achievement.module`（Domain）→ `account.module`（Infrastructure）的跨 BC 依賴。Badge 寫入沒有事件溯源，無法稽核。

**建議修正方向**  
採用事件驅動整合：`achievement.module` 發布 `AchievementUnlocked` Domain Event；`account.module` 訂閱此事件，在自己的 Application Layer 更新 `AccountEntity.profile.badgeSlugs`；移除 `IAccountBadgeWritePort`。

---

### INT-003 `CausalNode.kind` 硬編碼跨模組實體名稱

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 中（🟡） |
| **受影響模組** | `causal-graph.module` |

`causal-graph.module` 的 Domain Layer 直接硬編碼了來自其他模組的實體名稱（`'settlement'`, `'audit-entry'`）。見 API-005 的詳細修正建議。

---

### INT-004 Namespace-Account 同步機制缺乏明確的整合合約

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 高（🔴） |
| **受影響模組** | `namespace.module`, `account.module` |

**問題描述**  
架構定義了不變量：`Account.handle must be kept in sync with the namespace slug`，但沒有定義哪個模組負責更新、是否需要在同一 Transaction 中完成、以及如何回滾。

**建議修正方向**  
在 `docs/architecture/catalog/event-catalog.md` 中明確定義：`account:handle:changed` → `namespace:slug:updated` 的事件鏈；在 `namespace.module/core/_use-cases.ts` 中定義 `syncNamespaceSlug()` use case。

---

### INT-005 `SearchIndexEntry` 未定義索引建立觸發機制

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 中（🟡） |
| **受影響模組** | `search.module` |

哪些模組的哪些 Domain Event 會觸發搜尋索引更新？索引更新是同步還是非同步？索引失敗時如何補救？這些機制均未定義。

**建議修正方向**  
在 `docs/architecture/catalog/event-catalog.md` 定義各模組中觸發搜尋索引更新的事件清單，以及索引更新的非同步 pattern（Queue → search.module Handler）。

---

### INT-006 `AuditEntry` 建立後無事件發布，稽核不可觀察

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 低（🟢） |
| **受影響模組** | `audit.module` |

`audit.module` 接收其他模組的事件並建立 `AuditEntry`，但本身不發布任何 Domain Event。若外部系統（如安全監控）需要實時感知稽核記錄的建立，目前沒有可訂閱的介面。

---

## Part C: API / Interface Issues / API 契約問題

> Port 介面設計缺陷、API 契約不完整、跨模組接口耦合。

### API-001 `IAccountRepository.save()` 缺乏樂觀並發控制

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 高（🔴） |
| **受影響模組** | `account.module` |

`IAccountRepository.save(account)` 介面無版本控制參數，無法實作樂觀並發控制（OCC）。在多個 Server Action 並行修改同一帳號時，存在 last-write-wins 問題。

**建議修正方向**  
```typescript
interface IAccountRepository {
  save(account: AccountEntity, expectedVersion?: number): Promise<void>;
}
```

---

### API-002 `SearchIndexEntry.sourceModule` 使用 `string` 而非 union type

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 中（🟡） |
| **受影響模組** | `search.module` |

`sourceModule: string` 無型別約束，任何呼叫者都可以傳入任意值。

**建議修正方向**  
在 `src/shared/types/index.ts` 定義 `DomainModuleName` union type，並在 `SearchIndexEntry.sourceModule` 使用此 type。

---

### API-003 `AuditEntry.actor.accountHandle` 洩漏表現層概念至不可變稽核記錄

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 中（🟡） |
| **受影響模組** | `audit.module` |

`ActorRef.accountHandle` 是可變的 URL slug，嵌入不可變的 `AuditEntry` 後，用戶更換 handle 會導致歷史記錄失真。

**建議修正方向**  
從 `ActorRef` 移除 `accountHandle`，僅保留不可變的 `identityId` 和 `accountId`；若需顯示 handle，在查詢時動態 join。

---

### API-004 `IAccountHandleAvailabilityPort` 與帳號建立之間存在 TOCTOU 競爭

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 高（🔴） |
| **受影響模組** | `account.module` |

`createPersonalAccount` 用例先 `isAvailable(handle)` 再 `repo.save(account)`，兩步驟之間存在競爭窗口，可能導致兩個並發請求搶到相同 handle。

**建議修正方向**  
使用 Firestore Transaction 原子地檢查+寫入，或在 Firestore Security Rules 加唯一性約束。

---

### API-005 `CausalNode.kind` 硬編碼跨模組類型字串

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 中（🟡） |
| **受影響模組** | `causal-graph.module` |

`CausalNodeKind` union 直接包含其他模組的實體名稱（`'settlement'`, `'audit-entry'`），造成 Domain → Domain 跨模組耦合。

**建議修正方向**  
改為 `string` type 加 Application Layer 驗證，或通過 Port 介面允許外部模組注入 kind 值。

---

### API-006 模組公開 API（barrel）缺少版本標記

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 低（🟢） |
| **受影響模組** | 所有 16 個模組 |

各模組 `index.ts` 沒有版本標記或變更日誌，依賴方無法感知 breaking change。

**建議修正方向**  
在各模組 `index.ts` 頂部添加 `@version` JSDoc 標記，並在 `README.md` 中維護 CHANGELOG 段落。

---

## Part D: Security Issues / 安全問題

> 權限控制缺陷、驗證漏洞、資料暴露風險。

### SEC-002 `buildAuditEntry()` 預設 `outcome: "success"`

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 中（🟡） |
| **受影響模組** | `audit.module` |

`buildAuditEntry()` 工廠函數硬編碼 `outcome: "success"`，呼叫者無法傳入 `"blocked"`，可能導致「被阻擋的操作」被記錄為「成功」。

**建議修正方向**  
將 `outcome` 改為工廠函數的必填參數：`buildAuditEntry(..., outcome: "success" | "blocked")`。

---

### SEC-003 JWT Custom Claims 無文件化的輪換策略

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 中（🟡） |
| **受影響模組** | `identity.module` |

Firebase JWT Custom Claims（`accountId`, `accountType`, `role`）在 Token 有效期（最長 1 小時）內不可變，但沒有文件定義 Claims 更新後的強制刷新機制。

**建議修正方向**  
在架構文件中定義 Claims 輪換策略：每次敏感操作前 Server Action 必須重新驗證 Token；`role` 變更後客戶端立即強制 `user.getIdToken(true)` 刷新。

---

### SEC-004 `WorkspaceVisibility.hidden` 無存取控制語意強制

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 中（🟡） |
| **受影響模組** | `workspace.module` |

`WorkspaceEntity.visibility: "visible" | "hidden"` 但 `hasWorkspaceAccess()` 完全不考慮 visibility，`"hidden"` workspace 的存取語意未被明確定義和執行。

**建議修正方向**  
在 Glossary 明確定義 `visibility: "hidden"` 的存取語意；若 `"hidden"` 有更嚴格語意，在 `hasWorkspaceAccess()` 中加入 visibility 前置檢查。

---

### SEC-005 `IAccountHandleAvailabilityPort` TOCTOU 競爭（安全面向）

見 **API-004** 的詳細描述。Handle 唯一性檢查與帳號建立之間的競爭窗口可能導致兩個用戶搶到相同 handle，造成資料一致性問題。

---

### SEC-006 `SettlementRecord.contractAmount` 無上限約束

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 低（🟢） |
| **受影響模組** | `settlement.module` |

`contractAmount: number` 沒有正數驗證和上限約束，可能允許寫入異常大或負數的合約金額。

**建議修正方向**  
在 `settlement.module/domain.settlement/_value-objects.ts` 定義 `ContractAmountSchema = z.number().positive()`，並在工廠函數中使用。

---

### SEC-007 Firestore Security Rules 未覆蓋實際使用的 Collections

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 高（🔴） |
| **受影響檔案** | `firestore.rules` |

`firestore.rules` 目前僅允許 `/users/{userId}` 路徑的讀寫，其他所有 Collection 均被 catch-all deny 規則拒絕，但程式碼實際使用 `identities`、`accounts`、`workspaces`、`wbs_tasks`、`issues`、`change_requests`、`namespaces`、`teams`、`settlements`、`audit_log` 等 Collections。

**建議修正方向**  
參照 `docs/architecture/catalog/service-boundary.md` §「Firestore Security Rules Strategy」，為每個 Collection 實作對應的 Firestore Security Rules。

> **已轉譯為 ADR 的問題**：
> - SEC-001 → [ADR-011](../architecture/adr/20260316-workspace-grant-expiry-invariant.md): WorkspaceGrant expiry domain invariant enforcement

---

## Part E: Performance Issues / 效能問題

> 可能導致載入延遲、Firestore 讀取過量、渲染瓶頸的設計問題。

### PERF-001 `WorkspaceEntity.tasks` 無界嵌入集合

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 高（🔴） |
| **受影響模組** | `workspace.module` |
| **受影響欄位** | `tasks?: Record<string, WorkspaceTask>` |

Firestore 文件上限 1MB；每次讀取 WorkspaceEntity 都會載入全部 tasks；無法在 Firestore 查詢層分頁。

**建議修正方向**  
將 `WorkspaceTask` 遷移至 Firestore Subcollection `workspaces/{workspaceId}/tasks/{taskId}`；`WorkspaceEntity` 只保留 `taskCount: number` 摘要欄位。

---

### PERF-002 `AccountEntity.members` 無界嵌入 MembershipRecord 集合

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 中（🟡） |
| **受影響模組** | `account.module` |
| **受影響欄位** | `members: readonly MembershipRecord[] \| null` |

大型組織（數百成員）每次讀取組織帳號都需傳輸整個成員列表（500 名成員 ≈ 100KB）。

**建議修正方向**  
將 `MembershipRecord` 拆分至獨立集合（`/memberships/{membershipId}`）；`AccountEntity` 保留 `memberCount: number` 摘要。

---

### PERF-003 `CausalPath` 含無界 nodes 和 edges 陣列

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 中（🟡） |
| **受影響模組** | `causal-graph.module` |

`CausalPath.nodes[]` 和 `edges[]` 沒有大小限制，複雜因果圖可能返回數十個節點和邊，且沒有分頁機制。

**建議修正方向**  
定義 `CausalPath` 的最大深度；實作分批解析；或定義 `summarizeCausalPath()` 返回摘要（僅含 rootCause + directEffects）。

---

### PERF-004 `NotificationRecord.data` 無大小約束

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 低（🟢） |
| **受影響模組** | `notification.module` |
| **受影響欄位** | `data?: Record<string, unknown>` |

通知的 `data` payload 沒有大小約束，若傳遞大型 payload 會造成 Firestore 通知集合的文件膨脹。

**建議修正方向**  
在 Application Layer 限制 `data` 的序列化大小；或定義 `MAX_NOTIFICATION_PAYLOAD_BYTES = 4096`；大型關聯資料應以 ID 引用方式傳遞。

---

### PERF-005 `SearchIndexEntry.tags` 無界陣列可能影響索引效率

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 低（🟢） |
| **受影響模組** | `search.module` |
| **受影響欄位** | `tags: readonly string[]` |

`SearchIndexEntry.tags` 沒有最大數量限制，Firestore `array-contains` 查詢的索引可能膨脹。

**建議修正方向**  
定義標籤數量上限（如 `MAX_TAGS = 20`），並在建立索引條目時截斷超量標籤。

---

## Part F: Domain Fields Issues / 欄位設計問題

> 欄位重疊、語意衝突、跨模組重複定義問題。

### FIELD-001 財務計算欄位混入 Work Domain

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 高（🔴） |
| **受影響模組** | `work.module` |
| **受影響欄位** | `quantity`, `unitPrice`, `discount`, `subtotal` |

`WorkItemEntity` 承載了財務計算責任，但「工作項目」是施工計劃領域概念，不應包含財務邏輯。三個模組（work、workspace、settlement）各自保存相同財務資料，且命名不一致（`subtotal` vs `lineAmount`）。

**建議修正方向**  
將 `WorkItemEntity` 的財務欄位提取為 settlement.module 可讀取的投影（Projection）或事件，而非嵌入 Entity。

---

### FIELD-002 三個不相容的 Location 結構體

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 高（🔴） |
| **受影響模組** | `work.module`, `workforce.module`, `workspace.module` |

`TaskLocation`、`ScheduleLocation`、`WorkspaceLocation` 三個結構不相容，無法互操作（`description` 必填性不同，`WorkspaceLocation` 有 ID 和層級關係）。

**建議修正方向**  
定義一個 `LocationRef` Value Object；其他模組透過 `locationId: string` 引用 `WorkspaceLocation`；廢棄 `TaskLocation` 和 `ScheduleLocation`。

---

### FIELD-003 `ScheduleAssignment` 同時持有兩個 location 欄位

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 中（🟡） |
| **受影響模組** | `workforce.module` |

`ScheduleAssignment` 同時含有 `location?: ScheduleLocation`（嵌入式）和 `locationId?: string`（引用式），兩者可能存在不一致。

**建議修正方向**  
選擇其一設計模式：**Referential（建議）**：僅保留 `locationId?: string`。

---

### FIELD-004 `ClaimLineItem.lineAmount` vs `WorkspaceTask.subtotal` vs `WorkItemEntity.subtotal`

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 中（🟡） |
| **受影響模組** | `settlement.module`, `workspace.module`, `work.module` |

同一計算邏輯（`quantity × unitPrice − discount`）在三個模組中以不同欄位名儲存，且計算公式也有差異（discount 是否納入）。

**建議修正方向**  
統一使用 `lineAmount` 或 `subtotal`，並確保各處公式一致。

---

### FIELD-005 `WorkspaceTask.name` vs `WorkItemEntity.title`

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 低（🟢） |

兩個代表「任務名稱」的欄位使用不同命名（`name` vs `title`）。

**建議修正方向**  
統一為 `title`（與 `SearchIndexEntry.title` 保持一致）。

---

### FIELD-006 `WorkspaceEntity.dimensionId` vs `ScheduleAssignment.accountId` — 同義不同名

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 中（🟡） |

兩個欄位都代表「擁有此聚合根的組織帳號 ID」，但命名不同（`dimensionId` vs `accountId`）。

**建議修正方向**  
統一命名（建議 `ownerAccountId`），並在 Glossary 說明此欄位的一致語意。

---

### FIELD-007 `MembershipRecord` 時間欄位命名不一致

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 低（🟢） |

`invitedAt` 和 `acceptedAt` 使用動詞+At 命名，與其他模組的 `createdAt / updatedAt` 慣例不同。

**建議修正方向**  
在 Glossary 確立時間欄位命名規範：`createdAt / updatedAt` 為所有聚合根的標準建立/更新時間；`{event}At` 為特定領域事件的發生時間（如 `invitedAt`, `acceptedAt`）。

---

## Part G: Business Flow Issues / 業務流程問題

> 使用者操作流程、業務流程邏輯、生命週期轉換問題。

### WF-001 Settlement `stage` 與 Workspace `lifecycleState` 語意架構不一致

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 中（🟡） |
| **受影響模組** | `settlement.module`, `workspace.module` |

Workspace 用 `state`（欄位名 `lifecycleState`）；Settlement 用 `stage`（欄位名 `stage`）。若未來有跨模組流程，協調兩個生命週期將更複雜。

**建議修正方向**  
在 Glossary 中定義：`state` = 即時快照（可逆）；`stage` = 流程階段（線性不可逆）；並統一各模組命名。

---

### WF-002 Fork `status` 與 Workspace `lifecycleState` 缺乏顯式耦合

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 中（🟡） |
| **受影響模組** | `fork.module`, `workspace.module` |

Workspace 進入 `stopped` 狀態時，其下的 active Fork 應如何處理？Fork 的 pending CR 被 merge-back 後，原 Workspace 如何更新？這些互動均未定義。

**建議修正方向**  
在 `fork.module/domain.fork/_service.ts` 或事件目錄中定義：`WorkspaceStopped` → `ForkAbandoned` 的事件觸發規則；`ForkMergeBackCompleted` → `WorkspaceBaselineUpdated` 的事件流。

---

### WF-003 Membership 邀請流程缺乏 Domain Service 描述

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 中（🟡） |
| **受影響模組** | `account.module` |

邀請→接受→撤銷流程的實作完全在 `infra.firestore/_repository.ts` 中（`invite`, `accept`, `updateRole`, `revoke`），繞過了 Domain Layer 的 Invariant 保護。

**建議修正方向**  
在 `AccountEntity` 中新增 Domain Method（`addPendingMember`、`acceptMembership`、`revokeMembership`），讓業務不變量在 Domain 層強制執行。

---

### WF-004 `ScheduleAssignment.originType` 的自動化分支流程未定義

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 低（🟢） |
| **受影響模組** | `workforce.module` |

`originType: "MANUAL" | "TASK_AUTOMATION"` 支援兩種建立來源，但「WBS 任務如何觸發排班自動建立」的業務流程在領域文件中均未描述。

---

### WF-005 `SettlementRecord.cycleIndex` 遞增規則未在 Domain 層強制

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 低（🟢） |
| **受影響模組** | `settlement.module` |

`cycleIndex` 是 monotonic counter，但沒有 Domain Method 提供「提交新請款 → cycleIndex++」的業務邏輯，遞增邏輯置於錯誤的層次。

**建議修正方向**  
在 `SettlementRecord` 或對應 Domain Service 中提供 `submitNewClaim(record, items): SettlementRecord`。

---

### WF-006 建立 Workspace 按鈕在 dimension/account 未就緒時可點擊但無可見結果

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 中（🟡） |
| **受影響模組** | `workspace.module`, `account.module` |
| **受影響檔案** | `workspaces-view.tsx`, `create-workspace-dialog.tsx`, `[slug]/workspaces/page.tsx` |

「建立空間」按鈕永遠可按，但 `CreateWorkspaceDialog` 因 `effectiveDimensionId` 為 `null` 而未掛載，使用者點擊後沒有任何回饋。

**建議修正方向**  
1. 在 `effectiveDimensionId` 不可用時將按鈕設為 disabled 並顯示明確原因。
2. 在 `CreateWorkspaceDialog.handleCreate()` 補上 `catch`，將例外轉為可見的錯誤訊息。
3. 在 `[slug]/workspaces/page.tsx` 路徑下補上 account/dimension ready gate。

---

## Part H: UI / UX Issues / 介面設計問題

> Domain Model 設計對 UI 層產生的負面影響、元件組合問題。

### UI-001 `WorkspaceCapability.config?: object` 使 UI 渲染不可預測

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 中（🟡） |
| **受影響模組** | `workspace.module` |
| **受影響欄位** | `WorkspaceCapability.config?: object` |

`config` 是完全不透明的鍵值物件，UI 無法在編譯時知道哪些設定鍵是有效的，導致 Presentation 層必須使用大量動態守衛。

**建議修正方向**  
改為 discriminated union，根據 `capability.type` 決定 config 的結構。

---

### UI-002 `WorkspaceAddress` 建模為完整實體地址，可能超出數位工作空間的需求

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 低（🟢） |

`WorkspaceAddress` 包含完整實體地址（`street`, `city`, `state`, `postalCode`, `country`），若未來需支援純數位工作空間，這個欄位在 UI 中會出現不相關的輸入表單。

**建議修正方向**  
在文件中明確說明 `WorkspaceAddress` 僅適用於「實體場域」的 workspace type；或將 `WorkspaceEntity` 設計為 discriminated union。

---

### UI-003 `WorkspacePersonnel` 欄位全部可選，UI 無法提供有效驗證提示

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 低（🟢） |

`WorkspacePersonnel.managerId`、`supervisorId`、`safetyOfficerId` 全部可選（`?`），Domain 層沒有任何不變量指出哪種 workspace type 需要哪些人員。

**建議修正方向**  
在 `workspace.module/domain.workspace/_service.ts` 中定義 `getRequiredPersonnel(workspaceType): Array<keyof WorkspacePersonnel>`。

---

### UI-004 `NotificationRecord.data?: Record<string, unknown>` 使通知 UI 無法靜態渲染

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 中（🟡） |
| **受影響模組** | `notification.module` |

通知的 `data` payload 完全不透明，UI 無法在沒有 runtime type narrowing 的情況下渲染通知詳情。

**建議修正方向**  
根據 `sourceEventKey` 定義 discriminated payload（`NotificationPayload` union type）。

---

### UI-005 `WorkspaceTask` 嵌入 `WorkspaceEntity.tasks` 導致 WBS 樹形 UI 無法分頁

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 中（🟡） |

見 **PERF-001** 的詳細說明。WBS 任務嵌入導致 UI 無法懶加載，初始渲染效能差，且存在 Firestore 文件大小超限風險。

---

## Part I: Semantic Issues / 語意衝突問題

> 跨模組或同模組內概念語意重疊、術語不一致、邊界模糊問題。

### SEM-002 `WorkspaceTask`（workspace.module）vs `WorkItemEntity`（work.module）語意重疊

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 高（🔴） |
| **受影響模組** | `workspace.module`, `work.module` |

兩個模組都定義了「任務」概念，但命名不統一（`name` vs `title`、`progressState` vs `status`）且職責邊界不清晰。

**建議修正方向**  
釐清職責邊界：`WorkspaceTask` 是否應委派給 `work.module` 的 `WorkItemEntity`？若兩者確有不同語意，需在文件中明確定義差異。

---

### SEM-004 單一 `assigneeId` vs 複數 `assigneeIds` 語意不一致

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 中（🟡） |
| **受影響模組** | `workspace.module`, `work.module`, `workforce.module` |

「指派」概念在不同模組建模方式不同：`WorkspaceTask.assigneeId`（單一可選）、`WorkItemEntity.assigneeId`（單一可選）、`ScheduleAssignment.assigneeIds`（必填陣列）。

**建議修正方向**  
在 Glossary 中定義「assignee（單一）」與「assignees（多人）」各自適用的場景，並確保欄位名稱反映複數或單數語意。

> **已轉譯為 ADR 的問題**：
> - SEM-001, SEM-006 → [ADR-010](../architecture/adr/20260316-status-semantic-disambiguation.md)
> - SEM-003, SEM-005 → [ADR-012](../architecture/adr/20260316-workspace-namespace-isolation.md)

---

## Part J: Documentation Issues / 文件問題

> 失效連結、路徑錯誤、格式問題、Skill 資產缺失。

### DOC-009 `.github/skills/next-best-practices/SKILL.md` — 19 個 references 檔案不存在

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 中（🟡） |
| **受影響檔案** | `.github/skills/next-best-practices/SKILL.md` |

`next-best-practices` skill 引用了 19 個 `references/` 子檔案，但 `.github/skills/next-best-practices/references/` 目錄尚未建立。

**建議修正**  
選擇其一：
1. 在 `.github/skills/next-best-practices/references/` 下建立對應檔案（完整實作）。
2. 將 SKILL.md 中的 references 區段改為直接內嵌內容，移除失效連結（最小修正）。

---

## Issue 26：所有模組 `core/_actions.ts` 錯誤使用 `'use server'` 指令

**嚴重程度：** 高（🔴）  
**狀態：** ✅ Fixed

16 個模組的 `core/_actions.ts` 頂端均有 `'use server';` 指令，但檔案內容僅為 re-export 轉接。Next.js 15.5+ 不允許 `'use server'` 檔案僅包含 re-export。**修正**：移除全部 16 個模組 `core/_actions.ts` 頂端的 `'use server';` 指令，還原為純粹的 re-export 轉接層。

---

## Issue 27 — Document AI 基礎設施 🔵 Scaffolded

**狀態：** ✅ Scaffolded — 見 [`docs/architecture/notes/document-ai.md`](../architecture/notes/document-ai.md) 完整架構設計文件。

兩段式解析流程：Firebase Storage 上傳 → Phase 1（Google Cloud Document AI, OCR） → Phase 2（Genkit / Gemini 2.5 Flash, 語意萃取） → `saveParsingIntent`（Firestore, SHA-256 去重） → `startParsingImport / finishParsingImport`（冪等工作項目物化）。

**待完成項目**
- [ ] GCP 建立 Document AI Invoice Parser Processor（`asia-east1`）
- [ ] 設定 `DOCAI_PROCESSOR_NAME` 環境變數並部署 Cloud Function
- [ ] 設定 `GOOGLE_GENAI_API_KEY` 至 Vercel / Firebase App Hosting 環境
- [ ] 在工作區 `/document-parser` 路由掛載 `DocumentParserView`
- [ ] 實作 `startParsingImport` → `work.module` 工作項目物化串接
- [ ] 考慮 Firebase App Check 保護 `processDocument` 端點

---

## 已解決問題存檔 / Resolved Issues Archive

| ID | 嚴重程度 | 問題描述 | 解決方式 |
|----|---------|---------|---------|
| 1 | 高 | `IdentityRecord` 缺少 `createdAt`/`updatedAt` | ✅ 補充時間欄位 |
| 2 | 高 | `AccountEntity.ownerId` 指向 Firebase UID 而非 accountId | ✅ 改為指向 personal accountId |
| 3 | 中 | `WorkspaceEntity` 未定義 `createdBy` | ✅ 補充 `createdBy: string` |
| 4 | 中 | `IssueEntity` 缺少 `createdAt` | ✅ 補充時間欄位 |
| 5 | 低 | `FileRecord.mimeType` 未驗證 | ✅ 加入 MIME 驗證 |
| 6 | 高 | `WorkspaceTask.state` 允許非法轉換 | ✅ 加入狀態機守衛 |
| 7 | 中 | `AccountHandle` 允許空字串 | ✅ 加入非空驗證 |
| 8 | 高 | `AccountEntity.accountType` 可為 null | ✅ 加入 fallback 至 `"personal"` |
| 9 | 中 | `MembershipRecord.status` 無預設值 | ✅ 設預設為 `"pending"` |
| 10 | 高 | `WorkspaceEntity.lifecycle` 允許非法轉換 | ✅ 加入生命週期守衛 |
| 11 | 中 | `IdentityRecord.provider` 未驗證 | ✅ 加入 provider 驗證 |
| 12 | 低 | `NotificationRecord.type` 允許空字串 | ✅ 加入非空驗證 |
| 13 | 高 | `AccountEntity.handle` 在建立時未驗證唯一性 | ✅ 加入唯一性檢查 |
| 14 | 中 | `WorkspaceTask.assigneeId` 未驗證 accountId 格式 | ✅ 加入格式驗證 |
| 15 | 低 | `SettlementRecord.cycleIndex` 初始值為 null | ✅ 設預設為 0 |
| 16 | 高 | `org.module` 與 `account.module` 重複定義組織概念 | ✅ 移除 `org.module`，統一至 `account.module` |
| 17 | 中 | `identity.module` 洩漏 Firebase UID 至其他模組 | ✅ 透過 `identityId` 隔離 |
| 18 | 低 | `Namespace.slug` 允許大寫字母 | ✅ 加入小寫轉換與驗證 |
| 26 | 高 | 所有 16 個模組 `core/_actions.ts` 錯誤使用 `'use server'`（Build 失敗） | ✅ 移除 `'use server';` 指令 |
| DOC-001 | 高 | `docs/architecture/README.md` MDHA 相對路徑錯誤（`./model-driven...` 應為 `./notes/model-driven...`） | ✅ 已修正為 `./notes/` 路徑 |
| DOC-002 | 中 | `docs/architecture/README.md` Architecture Issues 連結路徑雙重巢套 | ✅ 已修正為 `../management/issues.md` |
| DOC-003 | 中 | `docs/architecture/overview.md` MDHA 相對路徑錯誤 | ✅ 已修正 |
| DOC-004 | 中 | `docs/architecture/glossary/technical-terms.md` MDHA 父層路徑錯誤 | ✅ 已隨 glossary 合併作廢（technical-terms.md 已整合至 glossary.md） |
| DOC-005 | 中 | `docs/architecture/catalog/service-boundary.md` MDHA 父層路徑錯誤 | ✅ 已修正 |
| DOC-006 | 高 | `docs/architecture/notes/model-driven-hexagonal-architecture.md` 多處相對路徑錯誤 | ✅ 已修正為 `../glossary/` 和 `../catalog/` |
| DOC-007 | 中 | MDHA `./README.md` 指向不存在檔案 | ✅ `docs/architecture/notes/README.md` 已建立 |
| DOC-008 | 中 | `docs/copilot/README.md` mcp.md 連結路徑 `./docs/copilot/mcp.md` 應為 `./mcp.md` | ✅ 已修正為 `./mcp.md` |
