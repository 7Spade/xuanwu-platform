# Workflow Issues / 流程設計問題報告

> 記錄使用者操作流程、業務流程邏輯、生命週期轉換，以及步驟順序不合理的問題。

---

## WF-001 Settlement 生命週期 `stage` 與 Workspace 生命週期 `lifecycleState` 語意架構不一致

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 中（🟡） |
| **受影響模組** | `settlement.module`, `workspace.module` |
| **受影響檔案** | `domain.settlement/_entity.ts`, `domain.workspace/_entity.ts` |

**問題描述**  
兩個模組都定義了線性前進的生命週期，但命名設計完全不同：

**Workspace 生命週期：**
```typescript
type WorkspaceLifecycleState = "preparatory" | "active" | "stopped"
```
欄位名：`lifecycleState`，型別名：`WorkspaceLifecycleState`

**Settlement 生命週期：**
```typescript
type FinanceLifecycleStage = "claim-preparation" | "submitted" | "payment-term" | "completed"
```
欄位名：`stage`，型別名：`FinanceLifecycleStage`

一個用 `State`，另一個用 `Stage`；一個欄位叫 `lifecycleState`，另一個叫 `stage`。
若未來有跨模組流程（如 workspace stopped → settlement completed），協調兩個生命週期將更複雜。

**建議修正方向**  
在 `docs/architecture/glossary/technical-terms.md` 中定義：
- `state` = 即時快照（snapshot），適用可逆的狀態
- `stage` = 流程階段（step），適用線性不可逆的生命週期
並統一各模組命名。

---

## WF-002 Fork 的 `status` 與 Workspace 的 `lifecycleState` 缺乏顯式耦合

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 中（🟡） |
| **受影響模組** | `fork.module`, `workspace.module` |
| **受影響檔案** | `domain.fork/_entity.ts`, `domain.workspace/_entity.ts` |

**問題描述**  
`ForkEntity.status: ForkStatus` 是 Fork 自身的生命週期，而 Fork 的 `originWorkspaceId` 連接到某個 Workspace。
但架構中沒有明確規定：
- Workspace 進入 `stopped` 狀態時，其下的 active Fork 應如何處理？
- 若 Fork 的 pending CR 被 merge-back 後，原 Workspace 如何更新？

這兩個生命週期目前是完全獨立的，沒有顯式的業務規則描述它們的互動。

**建議修正方向**  
在 `fork.module/domain.fork/_service.ts` 或事件目錄（`event-catalog.md`）中定義：
- `WorkspaceStopped` → `ForkAbandoned` 的事件觸發規則
- `ForkMergeBackCompleted` → `WorkspaceBaselineUpdated` 的事件流

---

## WF-003 Membership 邀請流程缺乏 Domain Service 描述

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 中（🟡） |
| **受影響模組** | `account.module` |
| **受影響檔案** | `domain.account/_service.ts`, `domain.account/_entity.ts` |

**問題描述**  
`AccountEntity` 的 `members` 欄位記錄 `MembershipRecord`，其中 `status: "pending" | "active" | "revoked"`
暗示了一個邀請→接受→撤銷的流程。但：
1. `buildPersonalAccount` 和 `buildOrganizationAccount` 工廠函數均不創建成員資格記錄。
2. Domain Service 中有 `canInviteMember`、`isAlreadyMember` 等方法，但沒有 `invite(...)` 的領域操作。
3. 邀請流程的實作完全在 `infra.firestore/_repository.ts` 中（`invite`, `accept`, `updateRole`, `revoke`），
   繞過了 Domain Layer 的 Invariant 保護。

**建議修正方向**  
在 `AccountEntity` 中新增 Domain Method：
```typescript
addPendingMember(membership: MembershipRecord): AccountEntity  // returns new entity
acceptMembership(membershipId: string, now: string): AccountEntity
revokeMembership(membershipId: string): AccountEntity
```
讓業務不變量（如 `canInviteMember` 的前置檢查）在 Domain 層強制執行，而非散落在 Repository 層。

---

## WF-004 `ScheduleAssignment.originType` 的自動化分支流程未定義

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 低（🟢） |
| **受影響模組** | `workforce.module` |
| **受影響檔案** | `domain.workforce/_entity.ts` |
| **受影響欄位** | `originType: "MANUAL" \| "TASK_AUTOMATION"`, `originTaskId?: string` |

**問題描述**  
`ScheduleAssignment` 支援兩種建立來源：
- `MANUAL`：由使用者手動建立
- `TASK_AUTOMATION`：由 WBS 任務自動觸發（`originTaskId` 指向來源任務）

但「WBS 任務如何觸發排班自動建立」的業務流程（事件、條件、規則）在領域文件中均未描述：
- 哪個任務狀態變更觸發自動排班？
- 自動建立的排班初始狀態是什麼？
- 若自動排班被手動拒絕，任務狀態如何更新？

**建議修正方向**  
在 `docs/architecture/catalog/event-catalog.md` 中定義：
- `WorkItemStatusChanged → {work.module}` 事件如何觸發 `workforce.module` 的 use case
- 自動排班建立的前置條件和失敗處理

---

## WF-005 `SettlementRecord.cycleIndex` 遞增規則未在 Domain 層強制

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 低（🟢） |
| **受影響模組** | `settlement.module` |
| **受影響檔案** | `domain.settlement/_entity.ts` |
| **受影響欄位** | `cycleIndex: number` |

**問題描述**  
`SettlementRecord.cycleIndex` 是「monotonic cycle counter，incremented when a new claim is submitted」，
但 `buildSettlementRecord` 初始值為 0，且沒有 Domain Method 提供「提交新請款 → cycleIndex++」的業務邏輯。
若遞增邏輯在 Repository 或 Application 層實作，則業務不變量被置於錯誤的層次。

**建議修正方向**  
在 `SettlementRecord` 或對應的 Domain Service 中提供：
```typescript
function submitNewClaim(record: SettlementRecord, items: ClaimLineItem[]): SettlementRecord
// 確保 cycleIndex 遞增，stage 轉換，並驗證金額不超過 contractAmount
```

---

## WF-006 建立 Workspace 流程在 account/dimension 未就緒時可點擊但無可見結果

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 中（🟡） |
| **受影響模組** | `workspace.module`, `account.module` |
| **受影響檔案** | `src/modules/workspace.module/_components/workspaces-view.tsx`, `src/modules/workspace.module/_components/create-workspace-dialog.tsx`, `src/app/(main)/[slug]/workspaces/page.tsx` |

**問題描述**  
目前 Workspace 列表頁的「建立空間」按鈕會直接執行 `setCreateOpen(true)`，但建立對話框只在 `effectiveDimensionId` 有值時才會被渲染。這造成一個流程斷點：

1. 使用者可在 account context 尚未完成解析、或 dimension 尚未可用時點擊建立按鈕。
2. 畫面 state 進入 `createOpen = true`，但 `CreateWorkspaceDialog` 因 `effectiveDimensionId` 為 `null` 而根本沒有掛載。
3. 使用者看不到任何 Dialog、錯誤提示或 loading feedback，主觀感受就是「按了沒反應」。

目前相關實作為：

- `workspaces-view.tsx` 中，按鈕永遠可按：`onClick={() => setCreateOpen(true)}`
- `workspaces-view.tsx` 中，`CreateWorkspaceDialog` 僅在 `effectiveDimensionId && (...)` 條件成立時渲染
- `[slug]/workspaces/page.tsx` 版本的頁面只傳入 `slug`，未先保證 dimension/account 已完成解析

此外，`create-workspace-dialog.tsx` 的 `handleCreate()` 只有 `try/finally`，沒有 `catch`；若前端 runtime 例外發生，使用者同樣缺乏可見錯誤回饋，會放大「沒反應」的感受。

**根本原因**  
建立流程把「是否允許進入建立步驟」的守門條件放在 Dialog 是否渲染，而不是放在互動入口本身。也就是說，流程前置條件（dimension/account ready）沒有在按鈕層被顯式檢查、阻擋或提示，導致 UI 允許觸發一個無法完成的流程分支。

**建議修正方向**  
1. 將「建立空間」按鈕與空狀態 CTA 在 `effectiveDimensionId` 不可用時設為 disabled，並顯示明確原因（例如帳號內容載入中或目前無可用 dimension）。
2. 或改為與 `7Spade/xuanwu` 一樣使用獨立路由／攔截式 modal 頁面開啟建立流程，避免以條件渲染承擔流程守門責任。
3. 在 `CreateWorkspaceDialog.handleCreate()` 補上 `catch`，將 runtime 或 repository 例外轉為使用者可見的錯誤訊息。
4. 在 `[slug]/workspaces/page.tsx` 路徑下補上 account/dimension ready gate，避免頁面在必要上下文尚未就緒時就暴露可互動的建立入口。
