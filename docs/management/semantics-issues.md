# Semantics Issues / 語意衝突問題報告

> 記錄跨模組或同模組內**概念語意重疊、術語不一致、邊界模糊**的問題。
> 這類問題不一定造成即時執行錯誤，但長期會導致維護者理解偏差與模型腐化。

---

## SEM-001 `status` 欄位語意過載（多模組重用同名欄位）

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 高（🔴） |
| **受影響模組** | `workspace.module`, `account.module`, `work.module`, `workforce.module` |

**問題描述**  
`status` 在以下位置被使用，但語意截然不同：

| 位置 | 型別 | 值域 |
|------|------|------|
| `WorkspaceGrant.status` | `"active" \| "revoked" \| "expired"` | 存取授權狀態 |
| `MembershipRecord.status` | `"pending" \| "active" \| "revoked"` | 成員資格狀態（含邀請流程） |
| `WorkItemEntity.status` | `WorkItemStatus` | 工作項目進度 |
| `ScheduleAssignment.status` | `ScheduleStatus` | 排班核准狀態 |
| `ForkEntity.status` | `ForkStatus` | Fork 生命週期 |

同一欄位名稱承載了：**存取控制**、**成員資格流程**、**任務進度**、**審批流程**、**生命週期**五種不同語意。

**風險**  
- 泛型工具（如 audit.module 的 `AuditEntry.resource`、search.module 的 `SearchIndexEntry`）在處理多模組資料時，
  `status` 欄位無法具備統一語意。
- 自動化流程或 AI 輔助查詢可能混淆「active 成員資格」與「active 存取授權」。

**建議修正方向**  
為各用途的 `status` 欄位採用更具語境的命名：

| 位置 | 建議重命名 |
|------|-----------|
| `WorkspaceGrant.status` | `grantStatus` |
| `MembershipRecord.status` | `membershipStatus` |
| `WorkItemEntity.status` | 保留（已有獨立型別 `WorkItemStatus`，語意明確） |

---

## SEM-002 `WorkspaceTask`（workspace.module）vs `WorkItemEntity`（work.module）語意重疊

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 高（🔴） |
| **受影響模組** | `workspace.module`, `work.module` |
| **受影響檔案** | `domain.workspace/_entity.ts`, `domain.work/_entity.ts` |

**問題描述**  
兩個模組都定義了「任務」概念：

| 特性 | `WorkspaceTask`（workspace.module） | `WorkItemEntity`（work.module） |
|------|-------------------------------------|--------------------------------|
| 位置 | 嵌入於 `WorkspaceEntity.tasks` | 獨立聚合根 |
| 主鍵方式 | `Record<string, WorkspaceTask>` key | `WorkItemId` |
| 進度欄位 | `progressState: TaskState` | `status: WorkItemStatus` |
| 標題欄位 | `name: string` | `title: string` |
| 財務欄位 | `quantity`, `unitPrice`, `subtotal` | `quantity`, `unitPrice`, `discount`, `subtotal` |

兩者都涵蓋了任務的進度、財務金額、指派、父子關係等欄位，但命名不統一。

**根本原因**  
`work.module` 負責獨立的 WBS 工作項目管理，而 `workspace.module` 內嵌了一個與其高度相似的 `WorkspaceTask`，
可能是歷史遺留或並行開發造成的語意分裂。

**建議修正方向**  
1. 釐清職責邊界：`WorkspaceTask`（workspace.module）是否應委派給 `work.module` 的 `WorkItemEntity`？
2. 若兩者確有不同語意（Workspace-level task vs. WBS Work Item），需在文件中明確定義差異。
3. 統一命名：`name` vs `title`，`progressState` vs `status`。

---

## SEM-003 `dimensionId` 語意不一致

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 中（🟡） |
| **受影響模組** | `workspace.module`, `settlement.module`, `workforce.module` |
| **受影響檔案** | `domain.workspace/_entity.ts`, `domain.settlement/_entity.ts`, `domain.workforce/_entity.ts` |

**問題描述**  
`dimensionId` 在不同模組中使用，但含義說明不清晰：

| 位置 | 文件說明 | 實際意涵 |
|------|---------|---------|
| `WorkspaceEntity.dimensionId` | "the owning account's id" | 擁有者帳號 ID |
| `SettlementRecord.dimensionId` | 無明確說明 | 推斷為擁有者帳號 ID |

而 `ScheduleAssignment.accountId` 也表示「org account owning this assignment」，與 `dimensionId` 語意相同但命名不同。

**術語問題**  
「Dimension」不是業務術語，也不符合 DDD 的通用語言（Ubiquitous Language）。它可能來自早期設計的
「帳號維度」概念，但目前既無 Glossary 解釋也無一致用法。

**建議修正方向**  
1. 在 `docs/architecture/glossary/business-terms.md` 中正式定義 `dimensionId` 的語意。
2. 或將 `dimensionId` 統一重命名為 `ownerAccountId`，更符合通用語言。
3. 確保 `SettlementRecord.dimensionId` 與 `WorkspaceEntity.dimensionId` 指向相同的概念。

---

## SEM-004 單一 `assigneeId` vs 複數 `assigneeIds` 語意不一致

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 中（🟡） |
| **受影響模組** | `workspace.module`, `work.module`, `workforce.module` |

**問題描述**  
「任務被指派給誰」這個概念在不同模組中建模方式不同：

| 位置 | 欄位 | 型別 |
|------|------|------|
| `WorkspaceTask.assigneeId` | 可選單一人員 | `string \| undefined` |
| `WorkItemEntity.assigneeId` | 可選單一人員 | `string \| undefined` |
| `ScheduleAssignment.assigneeIds` | 必填陣列 | `readonly string[]` |

同一業務概念（「指派」）建模為不同型別，且無文件說明是刻意設計（排班需要多人同時指派）還是歷史不一致。

**建議修正方向**  
在 Glossary 中定義：「assignee（單一）」與「assignees（多人）」各自適用的場景，
並確保欄位名稱反映複數或單數語意。

---

## SEM-005 `AccountHandle` vs `NamespaceSlug` 語意耦合未在型別層面強制

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 中（🟡） |
| **受影響模組** | `account.module`, `namespace.module` |
| **受影響檔案** | `domain.account/_entity.ts`, `domain.namespace/_entity.ts` |

**問題描述**  
架構文件（MDHA）規定：
> _「Account.handle must be kept in sync with the namespace slug owned by this account.」_

但在型別系統中：
- `AccountHandle` 定義於 `account.module/domain.account/_value-objects.ts`（允許英數字、連字號、底線）
- `NamespaceSlug` 定義於 `namespace.module/domain.namespace/_value-objects.ts`（格式約束未必相同）

兩者是分開的 Branded Types，沒有型別層面的 isomorphism 保證，只能靠業務規則和 Firestore 寫入順序來維持同步，存在語意漂移風險。

**建議修正方向**  
1. 確認兩個 Zod schema 的 regex 約束是否完全相同。
2. 若相同，考慮在其中一個模組引用另一個的 schema（注意不能破壞模組邊界）。
3. 或在文件中明確說明同步機制（e.g., namespace 在 account 建立後由事件驅動建立）。

---

## SEM-006 `progressState` vs `state` vs `status` — 生命週期欄位命名不統一

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 低（🟢） |
| **受影響模組** | 多模組 |

**問題描述**  
表達「生命週期當前狀態」的欄位命名存在三種變體：

| 欄位名 | 使用位置 |
|--------|---------|
| `progressState` | `WorkspaceTask.progressState: TaskState` |
| `lifecycleState` | `WorkspaceEntity.lifecycleState: WorkspaceLifecycleState` |
| `status` | `WorkItemEntity.status`, `ForkEntity.status`, `MembershipRecord.status` |
| `stage` | `SettlementRecord.stage: FinanceLifecycleStage` |

**建議修正方向**  
在 Glossary 中定義術語使用規則：
- `status` = 當前狀態（適用短暫可變狀態）
- `stage` = 流程階段（適用線性前進的生命週期）
- `lifecycleState` = 整體生命週期（適用 aggregate root 本身）
- 廢棄 `progressState`，統一使用 `status`
