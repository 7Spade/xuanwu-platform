# UI/UX Issues / 介面設計問題報告

> 記錄 Domain Model 設計對 UI 層產生的負面影響、元件組合問題、佈局問題，
> 以及設計系統中的 UX 不一致性。

---

## UI-001 `WorkspaceCapability.config?: object` 使 UI 渲染不可預測

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 中（🟡） |
| **受影響模組** | `workspace.module` |
| **受影響檔案** | `src/modules/workspace.module/domain.workspace/_value-objects.ts` |
| **受影響欄位** | `WorkspaceCapability.config?: object` |

**問題描述**  
`WorkspaceCapability` 包含 `config?: object` 欄位，是完全不透明的鍵值物件。
UI 元件（如 Capabilities 設定頁面）無法在編譯時知道哪些設定鍵是有效的，
導致渲染邏輯必須使用大量 `typeof config === 'object' && config !== null` 動態守衛，
或在 Presentation 層硬編碼已知的 capability type 處理邏輯。

**建議修正方向**  
1. 將 `config` 改為 discriminated union，根據 `capability.type` 決定 config 的結構：
```typescript
export type WorkspaceCapabilityConfig =
  | { type: "ui"; theme?: string; layout?: "grid" | "list" }
  | { type: "api"; rateLimit?: number; authScheme?: "token" | "oauth" }
  | { type: "data"; retentionDays?: number }
  | { type: "governance"; approvalRequired?: boolean }
  | { type: "monitoring"; alertThreshold?: number };
```
2. 或至少定義 `config?: Record<string, string | number | boolean>` 限制值型別。

---

## UI-002 `WorkspaceAddress` 建模為完整實體地址，可能超出數位工作空間的需求

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 低（🟢） |
| **受影響模組** | `workspace.module` |
| **受影響檔案** | `src/modules/workspace.module/domain.workspace/_entity.ts` |
| **受影響欄位** | `WorkspaceAddress` |

**問題描述**  
`WorkspaceAddress` 包含完整的實體地址結構（`street`, `city`, `state`, `postalCode`, `country`, `details`），
針對的是「廠區/施工現場」場景。但若平台未來需要支援純數位工作空間（如軟體專案），
這個欄位在 UI 中會出現不相關的輸入表單。

**建議修正方向**  
1. 在文件中明確說明 `WorkspaceAddress` 僅適用於「實體場域（physical workspace）」的 workspace type。
2. 或將 `WorkspaceEntity` 設計為 discriminated union，區分 physical workspace 與 digital workspace，
   使 `address` 只在 physical variant 中出現。

---

## UI-003 `WorkspacePersonnel` 欄位全部可選，UI 表單無法提供有效驗證提示

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 低（🟢） |
| **受影響模組** | `workspace.module` |
| **受影響檔案** | `src/modules/workspace.module/domain.workspace/_entity.ts` |
| **受影響欄位** | `WorkspacePersonnel.managerId`, `supervisorId`, `safetyOfficerId` |

**問題描述**  
`WorkspacePersonnel` 的三個欄位全部可選（`?`），Domain 層沒有任何不變量指出「哪種 workspace type 需要哪些人員」。
UI 元件在建立 workspace 時，無法根據 Domain 定義提供有效的必填/選填引導。

**建議修正方向**  
在 `workspace.module/domain.workspace/_service.ts` 中定義輔助函數：
```typescript
function getRequiredPersonnel(workspaceType: string): Array<keyof WorkspacePersonnel>
```
讓 UI 層可以根據 workspace type 動態決定哪些 personnel 欄位為必填。

---

## UI-004 `NotificationRecord.data?: Record<string, unknown>` 使通知 UI 無法靜態渲染

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 中（🟡） |
| **受影響模組** | `notification.module` |
| **受影響檔案** | `src/modules/notification.module/domain.notification/_entity.ts` |
| **受影響欄位** | `data?: Record<string, unknown>` |

**問題描述**  
通知的 `data` payload 完全不透明，UI 無法在沒有 runtime type narrowing 的情況下渲染通知詳情。
例如「workspace 邀請通知」應包含 `workspaceId` 和 `workspaceName`，
但 UI 必須用 `(data as any).workspaceId` 或 `typeof data?.workspaceId === 'string'` 的方式取用。

**建議修正方向**  
根據 `sourceEventKey` 定義 discriminated payload：
```typescript
export type NotificationPayload =
  | { eventKey: "workspace:invitation"; workspaceId: string; workspaceName: string }
  | { eventKey: "achievement:badge_unlocked"; badgeSlug: string; xpGained: number }
  | { eventKey: "settlement:payment_received"; settlementId: string; amount: number };
```

---

## UI-005 `WorkspaceTask` 嵌入 `WorkspaceEntity.tasks` 導致 WBS 樹形 UI 無法分頁

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 中（🟡） |
| **受影響模組** | `workspace.module` |
| **受影響檔案** | `src/modules/workspace.module/domain.workspace/_entity.ts` |
| **受影響欄位** | `tasks?: Record<string, WorkspaceTask>` |

**問題描述**  
WBS 任務以 `Record<string, WorkspaceTask>` 嵌入在 `WorkspaceEntity` 中，
這意味著：
1. 每次載入 Workspace 時，會拉取所有 WBS 任務（可能達數百個）。
2. UI 的 WBS 樹形元件無法實現懶加載或分頁，初始渲染效能差。
3. Firestore 文件大小有 1MB 上限，大型 workspace 的 tasks 可能超限。

見 `performance-issues.md → PERF-001` 的詳細說明。

**建議修正方向**  
將 `tasks` 移出 `WorkspaceEntity`，改為獨立的 `WorkspaceTask` 子集合（subcollection），
透過 `work.module` 的 `WorkItemEntity` 統一管理，Workspace 只保留 `taskCount` 等摘要欄位。
