# Architecture Issues / 架構問題報告

> 本文件記錄在 xuanwu-platform 儲存庫中發現的架構問題、mDDD 違規與程式碼壞味道。
> 每個問題包含：受影響檔案、問題描述、嚴重程度，以及建議修正方向。

---

## 已解決問題摘要 / Resolved Issues Summary

以下問題已在先前 PR 中修正（Issues 1–18），不再展開詳述：

| # | 嚴重程度 | 問題類型 | 狀態 |
|---|---------|---------|------|
| 1 | 中 | 設計系統層數描述自相矛盾（3層 vs 4層） | ✅ Fixed |
| 2 | 中 | ADR 索引不同步（5筆 vs 7筆） | ✅ Fixed |
| 3 | 低 | Domain Modules 表格缺少 `workforce.module/` | ✅ Fixed |
| 4 | 高 | i18n 指示引用不存在的 JSON 檔案路徑 | ✅ Fixed |
| 5 | 高 | README DDD 層次結構圖描述的目錄路徑與實際不符 | ✅ Fixed |
| 6 | 高 | 引用不存在的 `docs/copilot/` 目錄 | ✅ Fixed |
| 7 | 低 | 文件範例描述尚未實現的組件如同現有功能 | ✅ Fixed |
| 8 | 中 | Visual Indicators 路徑錯誤（`presentation/` → `_components/`） | ✅ Fixed |
| 9 | 高 | xuanwu-ui.agent.md i18n 指示引用不存在的 JSON 路徑 | ✅ Fixed |
| 10 | 中 | 仍使用 Feature Slice 術語而非 Domain Module | ✅ Fixed |
| 11 | 低 | 仍使用 "slice boundaries" 術語 | ✅ Fixed |
| 12 | 中 | 引用不存在的 `docs/architecture/models/`、`blueprints/`、`guidelines/` | ✅ Fixed |
| 13 | 低 | `.serena\memories\*` 幻象本地路徑 | ✅ Fixed |
| 14 | 低至中 | 14 個檔案殘留 "slice" 術語或路徑慣例不符 | ✅ Fixed |
| 15 | 高 | 3 個 Bounded Context（Notification、Social、Achievement）未對應到任何 Module | ✅ Fixed |
| 16 | 高 | `Namespace` 錯誤歸入 `org.module`；`Profile` 錯誤歸入 `achievement.module` | ✅ Fixed |
| 17 | 高 | 缺少 `identity.module` 和 `account.module`；`profile.module` 冗餘 | ✅ Fixed |
| 18 | 高 | 缺少 `collaboration.module`、`search.module`、`audit.module`；`org.module` 冗餘 | ✅ Fixed |

---

## Issue 19：Presentation Layer 直接實例化 Infrastructure Repository（全域性 mDDD 違規）

**受影響範圍：** 15 個模組中的 **41 個** `_components/` 檔案  
**嚴重程度：** 高（🔴）

### 問題描述

mDDD 規定的依賴方向為：

```
Presentation → Application (use-cases) → Domain (ports) ← Infrastructure
```

但專案中，所有 `_components/` hook 和 View 元件均**直接** `new Firestore*Repository()`，繞過 Application 層的中介角色。Use-cases 雖已正確透過 port 介面接受 repository（如 `getWorkspaceById(repo, id)`），但 **repository 的實例化發生在 Presentation 層**，而非 Application 或 Infrastructure 層。

### 違規模式

```typescript
// ❌ 錯誤：Presentation 層直接實例化 Infrastructure 類別
// src/modules/workspace.module/_components/use-workspace.ts
import { FirestoreWorkspaceRepository } from "../infra.firestore/_repository"; // ← 越界

export function useWorkspace(workspaceId: string) {
  const repo = useMemo(() => new FirestoreWorkspaceRepository(), []); // ← 越界
  // ...
  getWorkspaceById(repo, workspaceId); // use-case 本身正確，但 repo 由 Presentation 創建
}
```

### 受影響檔案（依模組）

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

### 根本原因

缺少應用層的 Repository Factory 或依賴注入機制。Use-cases 的 Repository 參數設計是正確的，但目前沒有統一的位置在「正確的層次」建立 repository 實例，導致 Presentation 層填補了這個空缺。

### 修正方向

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

## Issue 20：Presentation Layer 直接 import Domain Layer 型別（19 處）

**受影響範圍：** `workspace.module`、`work.module`、`social.module`、`file.module`、`causal-graph.module`  
**嚴重程度：** 中（🟡）

### 問題描述

元件直接從 `domain.*/` 層匯入 Value Object 型別、Entity 型別與 Domain Service 函數，而非透過 Application 層公開的 DTO 取得所需資料形狀。

### 違規清單

| 檔案 | 違規 import | 層次 |
|------|-------------|------|
| `workspace.module/_components/work-item-edit-dialog.tsx` | `WorkItemStatus, WorkItemPriority` from `work.module/domain.work/_value-objects` | Domain VO |
| `workspace.module/_components/create-work-item-dialog.tsx` | `WorkItemPriority` from `work.module/domain.work/_value-objects` | Domain VO |
| `workspace.module/_components/workspace-nav-tabs.tsx` | `WorkspaceCapability` from `domain.workspace/_value-objects` | Domain VO |
| `workspace.module/_components/workspace-capabilities-view.tsx` | `WorkspaceCapability` from `domain.workspace/_value-objects`；`CAPABILITY_SPECS` from `domain.workspace/_capability-specs` | Domain VO + Const |
| `workspace.module/_components/workspace-card.tsx` | `WorkspaceLifecycleState` from `domain.workspace/_value-objects` | Domain VO |
| `workspace.module/_components/workspace-settings-dialog.tsx` | `WorkspaceLifecycleState`, `WorkspaceAddress`, `WorkspacePersonnel` from `domain.workspace/_entity` | Domain Entity types |
| `workspace.module/_components/workspace-shell.tsx` | `WorkspaceAddress` from `domain.workspace/_entity` | Domain Entity type |
| `workspace.module/_components/workspace-locations-view.tsx` | `WorkspaceLocation` from `domain.workspace/_entity` | Domain Entity type |
| `workspace.module/_components/workspace-files-view.tsx` | `getMimeGroup` from `file.module/domain.file/_service` | Cross-module Domain Service |
| `workspace.module/_components/wbs-view.tsx` | `buildTaskTree` from `work.module/domain.work/_task-tree` | Cross-module Domain Service |
| `workspace.module/_components/task-tree-node.tsx` | `TaskWithChildren` from `work.module/domain.work/_task-tree` | Cross-module Domain type |
| `workspace.module/_components/issues-view.tsx` | `IssueSeverity, IssueStatus` from `domain.issues/_entity` | Domain Entity types |
| `social.module/_components/social-actions-bar.tsx` | `SocialTargetType` from `domain.social/_value-objects` | Domain VO |
| `file.module/_components/file-item.tsx` | `getMimeGroup, MimeGroup` from `domain.file/_service` | Domain Service |
| `file.module/_components/file-preview.tsx` | `getMimeGroup` from `domain.file/_service` | Domain Service |
| `causal-graph.module/_components/causal-graph-view.tsx` | `CausalNode, CausalEdge` from `domain.causal-graph/_entity` | Domain Entity types |
| `causal-graph.module/_components/use-causal-graph.ts` | `CausalNode, CausalEdge, CausalNodeId` from `domain.causal-graph/_entity` | Domain Entity types |

**注意**：`buildTaskTree`、`getMimeGroup` 等純函數（無 I/O）匯入較不嚴重，但仍違反「元件只知道 DTO」的原則，因為它們讓 Presentation 層了解 Domain 的內部資料形狀。

### 修正方向

1. 將 Value Object 型別提升至 DTO 定義中（`core/_use-cases.ts`），或在 Application 層建立對應的 union type。
2. 將 Domain Service 函數（`buildTaskTree`、`getMimeGroup`）包裝為 Application 層的 utility，並透過 DTO 或 Application hook 公開。
3. Entity 內嵌型別（`WorkspaceAddress`, `WorkspacePersonnel`）應改為 DTO 欄位，定義在 `core/_use-cases.ts` 的相關 DTO 中。

---

## Issue 21：Module Public API（`index.ts`）匯出 Presentation Layer 元件（5 個模組）

**嚴重程度：** 中（🟡）

### 問題描述

以下模組的 `index.ts` 中直接 export `_components/` 的 React 元件與 hooks，違反「模組 Public API 只應匯出 DTO、Use-cases、Port 介面」的原則。其他模組若透過 `@/modules/<name>.module` barrel import 這些元件，等同於在模組邊界上建立了 Presentation 層的跨模組耦合。

| 模組 | 在 `index.ts` 匯出的 Presentation 元件 |
|------|---------------------------------------|
| `workspace.module` | `useWorkspace`, `WorkspaceNavTabs`, `WorkspaceShell`, `WorkspaceStatusBar`, `WorkspaceCapabilitiesView`, `WorkspaceGrantsView`, `WorkspaceSettingsDialog` |
| `audit.module` | `AuditLogView`, `WorkspaceAuditView`, `useWorkspaceAuditLog`, `useResourceAuditLog` |
| `file.module` | `useFiles`, `FileItem`, `FilePreview` |
| `search.module` | `GlobalSearchDialog`, `SearchResultsView`, `SearchFilterBar`, `useSearchHistory` |
| `social.module` | `SocialActionsBar`, `SocialFeedView`, `SocialExploreView`, `FollowersPanel` |

### 修正方向

從各模組的 `index.ts` 中移除所有 `_components/` 相關的 export。  
頁面（`src/app/`）與父元件應直接從 `@/modules/<name>.module/_components/<file>` import，而非透過 barrel。

---

## Issue 22：Module Public API 匯出 Domain Layer 物件（2 個模組）

**嚴重程度：** 中（🟡）

### 問題描述

`index.ts` Public API 暴露了 Domain Layer 的 Entity 型別、Domain Service 函數與領域常數，讓其他模組可以繞過 Application 層直接使用 Domain 內部物件。

#### `workspace.module/index.ts`

```typescript
// ❌ 匯出 Domain Entity 型別
export type { WorkspaceEntity } from "./domain.workspace/_entity";

// ❌ 匯出 Domain Service 函數（有副作用的邏輯）
export { hasWorkspaceAccess } from "./domain.workspace/_entity";

// ❌ 匯出 Domain 常數
export { CAPABILITY_SPECS, NON_MOUNTABLE_CAPABILITY_IDS } from "./domain.workspace/_capability-specs";

// ⚠️ 匯出 Domain 純狀態工具（邊界模糊）
export { summarizeWorkflowBlockers, deriveWorkflowBlockersFromSources, ... } from "./domain.workspace/workflow-blockers-state";
```

#### `work.module/index.ts`

```typescript
// ❌ 匯出 Domain Service 函數
export { buildTaskTree } from "./domain.work/_task-tree";

// ❌ 匯出 Domain 內部型別
export type { TaskWithChildren } from "./domain.work/_task-tree";
```

### 修正方向

- `WorkspaceEntity` → 移除，使用者改用 `WorkspaceDTO`
- `hasWorkspaceAccess` → 封裝在 Application use-case 內，不直接暴露
- `CAPABILITY_SPECS` → 若外部需要，透過 Application 層 query 取得
- `buildTaskTree` → 包裝成 Application 層 utility（e.g. `getWorkItemTree(repo, workspaceId): Promise<TaskWithChildren[]>`）

---

## Issue 23：workspace.module 跨模組直接存取 work.module 內部層（6 個元件）

**嚴重程度：** 高（🔴）

### 問題描述

`workspace.module` 的 `_components/` 目錄中，有 6 個元件直接 import `work.module` 的 `infra.firestore/` 與 `domain.work/` 內部路徑，**完全繞過 `work.module` 的 `index.ts` Public API**。

這是模組邊界的根本性違反：任何跨模組依賴都應該透過目標模組的 `index.ts` barrel 進行，不可存取其內部層。

### 違規清單

| 違規元件 | 直接存取的 work.module 內部路徑 |
|---------|-------------------------------|
| `work-item-edit-dialog.tsx` | `work.module/infra.firestore/_repository`（Infrastructure）、`work.module/domain.work/_value-objects`（Domain） |
| `progress-report-dialog.tsx` | `work.module/infra.firestore/_repository`（Infrastructure） |
| `workspace-qa-view.tsx` | `work.module/infra.firestore/_repository`（Infrastructure） |
| `workspace-acceptance-view.tsx` | `work.module/infra.firestore/_repository`（Infrastructure） |
| `create-work-item-dialog.tsx` | `work.module/infra.firestore/_repository`（Infrastructure）、`work.module/domain.work/_value-objects`（Domain） |
| `workspace-finance-view.tsx` | `work.module/infra.firestore/_repository`（Infrastructure） |
| `task-tree-node.tsx` | `work.module/infra.firestore/_repository`（Infrastructure）、`work.module/domain.work/_task-tree`（Domain） |
| `work-item-row.tsx` | `work.module/infra.firestore/_repository`（Infrastructure） |
| `task-editor-dialog.tsx` | `work.module/infra.firestore/_repository`（Infrastructure） |
| `use-work-items.ts` | `work.module/infra.firestore/_repository`（Infrastructure） |
| `wbs-view.tsx` | `work.module/domain.work/_task-tree`（Domain） |

**此外，`workspace.module` 也直接存取 `account.module/infra.firestore/_repository`（`use-members.ts`）。**

### 修正方向

1. 所有 `work.module` 相關的 use-case 呼叫應透過 `work.module` 的 `index.ts` 中公開的函數。
2. 在 `work.module/index.ts` 補充所有 workspace 需要的操作（`updateWorkItem`、`deleteWorkItem`、`createChildWorkItem`、`reportProgress`）。
3. Repository 實例化應移至 `work.module` 內部（透過服務層或 DI），不讓外部模組知道 `FirestoreWorkItemRepository` 的存在。

---

## Issue 24：跨模組 Presentation Layer 元件直接依賴（3 處）

**嚴重程度：** 中（🟡）

### 問題描述

以下三處違規是一個模組的 `_components/` 直接 import 另一個模組的 `_components/`，形成**跨模組的 Presentation 層耦合**。正確做法是：兩個模組的 Presentation 層都不應直接依賴對方，應透過共享 Context 或 props 傳遞。

| 違規元件 | 直接 import 的跨模組元件 |
|---------|------------------------|
| `settlement.module/_components/billing-view.tsx:21` | `@/modules/namespace.module/_components/use-namespace-by-slug` |
| `workspace.module/_components/dashboard-view.tsx:26` | `@/modules/audit.module/_components/audit-log-view` |
| `workspace.module/_components/dashboard-view.tsx:27` | `@/modules/audit.module/_components/use-audit-log` |

### 分析

- **settlement → namespace**：`billing-view` 透過 `useNamespaceBySlug` 取得 workspace 計數以顯示免費方案用量。這個資訊應透過 `namespace.module` 的 Application 層（use-case / query）提供，而非直接耦合到另一模組的 hook。
- **workspace → audit**：`dashboard-view` 把 `AuditLogView` 直接嵌入渲染，形成 workspace Presentation 依賴 audit Presentation。`AuditLogView` 的使用應透過 props 組合或 `slot` 模式，由頁面（`src/app/`）層組合兩個元件。

### 修正方向

1. **settlement → namespace**：在 `namespace.module/index.ts` 公開 `getNamespaceStats(slug)` query，`billing-view` 呼叫此 use-case 取得 `workspaceCount`，移除對 `_components/use-namespace-by-slug` 的直接依賴。
2. **workspace → audit**：在 `dashboard-view` 的父層頁面（`src/app/(main)/...`）組合 `DashboardView` 和 `AuditLogView`，或透過 React `children`/`slot` props 注入，切斷跨模組 Presentation 耦合。

---

## Issue 25：`useCurrentAccount` 跨模組 Presentation Hook 耦合（7 個模組）

**嚴重程度：** 中（🟡）（程式碼壞味道）

### 問題描述

`useCurrentAccount()` hook 定義在 `account.module/_components/account-provider.tsx`，但有 **7 個不同模組**的 `_components/` 直接 import 它。這讓 7 個模組的 Presentation 層都與 `account.module` 的 **內部** Presentation 層產生硬耦合。

### 違規清單

```
collaboration.module/_components/comment-thread.tsx
namespace.module/_components/organizations-view.tsx
search.module/_components/search-results-view.tsx
search.module/_components/global-search-dialog.tsx
workspace.module/_components/dashboard-view.tsx
workspace.module/_components/daily-workspace-view.tsx
workspace.module/_components/shell/nav-user.tsx
workspace.module/_components/workspaces-view.tsx
workspace.module/_components/daily-log-card.tsx
workspace.module/_components/issues-view.tsx
notification.module/_components/notifications-view.tsx
```

（11 個元件，遍及 7 個模組）

### 問題核心

- `useCurrentAccount` 是一個 Presentation 層 hook，透過 React Context 存取 `account-provider` 提供的 session 狀態。
- 其他模組**依賴 `account.module` 的 Presentation 內部實作細節**，而非 `account.module` 的公開 API。
- 若 `account-provider.tsx` 重構或重命名，所有 7 個模組都會受影響。

### 修正方向

**方案（推薦）：將 `useCurrentAccount` 提升至 `account.module` 的 Public API**

在 `account.module/index.ts` 中補充：

```typescript
export { useCurrentAccount } from "./_components/account-provider";
export type { CurrentAccountState } from "./_components/account-provider";
```

這樣外部模組仍透過模組 barrel import，而非直接進入內部路徑。同時為 `useCurrentAccount` 定義穩定的介面合約。

> **更長遠的作法**：將 `CurrentAccount` 狀態提升到 `src/infrastructure/session/` 的 React Context，使其不屬於任何單一 Domain Module，而是整個應用的 session provider。

---

## 摘要表 / Summary（現有待解決問題）

| # | 嚴重程度 | 違規類型 | 受影響範圍 | 狀態 |
|---|---------|---------|-----------|------|
| 19 | 高（🔴）| Presentation Layer 直接實例化 Infrastructure Repository | 41 個元件檔案，14 個模組 | ❌ Open |
| 20 | 中（🟡）| Presentation Layer 直接 import Domain Layer 型別 | 17 個元件，5 個模組 | ❌ Open |
| 21 | 中（🟡）| Module Public API（`index.ts`）匯出 Presentation Layer 元件 | 5 個模組 | ❌ Open |
| 22 | 中（🟡）| Module Public API 匯出 Domain Layer 物件（Entity、Service、常數） | `workspace.module`, `work.module` | ❌ Open |
| 23 | 高（🔴）| workspace.module 跨模組直接存取 work.module / account.module 內部層 | 11 個元件 | ❌ Open |
| 24 | 中（🟡）| 跨模組 Presentation Layer 元件直接依賴 | 3 個元件，3 個模組 | ❌ Open |
| 25 | 中（🟡）| `useCurrentAccount` 跨模組 Presentation Hook 耦合（壞味道） | 11 個元件，7 個模組 | ❌ Open |
