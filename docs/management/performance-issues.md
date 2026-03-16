# Performance Issues / 效能問題報告

> 記錄可能導致載入延遲、Firestore 讀取過量、渲染瓶頸的設計問題，
> 以及資料結構不利於分頁或懶加載的情況。

---

## PERF-001 `WorkspaceEntity.tasks` 無界嵌入集合

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 高（🔴） |
| **受影響模組** | `workspace.module` |
| **受影響檔案** | `src/modules/workspace.module/domain.workspace/_entity.ts` |
| **受影響欄位** | `tasks?: Record<string, WorkspaceTask>` |

**問題描述**  
`WorkspaceEntity` 包含 `tasks?: Record<string, WorkspaceTask>` 作為 WBS 任務的嵌入集合。
這個設計帶來以下效能風險：

1. **Firestore 文件大小限制**：Firestore 單一文件上限為 **1MB**。
   一個 `WorkspaceTask` 包含約 15 個欄位，若每個任務約 500 bytes，
   超過約 2000 個任務就會觸及上限，導致寫入靜默失敗或拋出異常。

2. **Cold Read 效能**：每次讀取 WorkspaceEntity 都會載入全部 tasks，
   即使 UI 只顯示前 20 個任務。網路傳輸量隨任務數線性成長。

3. **無法分頁**：嵌入式 `Record<string, WorkspaceTask>` 無法在 Firestore 查詢層分頁，
   必須全部載入後在客戶端過濾。

**建議修正方向**  
將 `WorkspaceTask` 遷移至 Firestore Subcollection：
```
workspaces/{workspaceId}/tasks/{taskId}
```
`WorkspaceEntity` 只保留 `taskCount: number` 摘要欄位，詳細任務通過 `work.module` 的 `IWorkItemRepository` 查詢。

---

## PERF-002 `AccountEntity.members` 無界嵌入 MembershipRecord 集合

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 中（🟡） |
| **受影響模組** | `account.module` |
| **受影響檔案** | `src/modules/account.module/domain.account/_entity.ts` |
| **受影響欄位** | `members: readonly MembershipRecord[] \| null` |

**問題描述**  
組織帳號的所有成員資格記錄嵌入在 `AccountEntity.members` 中（array）。
對於大型組織（如數百成員的建設公司），每次讀取組織帳號都需傳輸整個成員列表。

每個 `MembershipRecord` 含 5 個欄位，假設一條記錄 ~200 bytes：
- 500 名成員 = ~100KB — 接近 Firestore 文件限制的 10%
- 5000 名成員 = ~1MB — 直逼 Firestore 文件上限

**建議修正方向**  
將 `MembershipRecord` 拆分至獨立集合（`/memberships/{membershipId}`），
`AccountEntity` 保留 `memberCount: number` 摘要，
通過 `IMembershipRepository` 查詢時支持分頁。

---

## PERF-003 `CausalPath` 含無界 nodes 和 edges 陣列

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 中（🟡） |
| **受影響模組** | `causal-graph.module` |
| **受影響檔案** | `src/modules/causal-graph.module/domain.causal-graph/_entity.ts` |
| **受影響欄位** | `nodes: CausalNode[]`, `edges: CausalEdge[]` |

**問題描述**  
`CausalPath` 是「resolved chain from root cause to terminal effect」的完整路徑，
包含 `nodes: CausalNode[]` 和 `edges: CausalEdge[]` 兩個陣列，沒有大小限制。

在複雜的因果圖中（如跨越多個 milestone 和 CR 的影響鏈），
一次路徑解析可能返回數十個節點和邊，並且沒有分頁機制。

**建議修正方向**  
1. 定義 `CausalPath` 的最大深度（`maxDepth: number` 限制）。
2. 實作分批解析（lazily expand path on demand）。
3. 或在 Domain Layer 定義 `summarizeCausalPath()` 返回摘要（僅含 rootCause + directEffects）。

---

## PERF-004 `NotificationRecord.data` 無大小約束

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 低（🟢） |
| **受影響模組** | `notification.module` |
| **受影響檔案** | `src/modules/notification.module/domain.notification/_entity.ts` |
| **受影響欄位** | `data?: Record<string, unknown>` |

**問題描述**  
通知的 `data` payload 沒有大小約束，理論上可以包含任意大小的物件。
若通知系統被用來傳遞大型 payload（如工作項目的完整快照），
會造成 Firestore 通知集合的文件膨脹。

**建議修正方向**  
1. 在 Application Layer 的 `createNotification` use case 中限制 `data` 的序列化大小。
2. 或在 Domain Layer 定義 `MAX_NOTIFICATION_PAYLOAD_BYTES = 4096`。
3. 大型關聯資料應以 ID 引用方式傳遞，UI 按需查詢。

---

## PERF-005 `SearchIndexEntry.tags` 無界陣列可能影響索引效率

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 低（🟢） |
| **受影響模組** | `search.module` |
| **受影響欄位** | `tags: readonly string[]` |

**問題描述**  
`SearchIndexEntry.tags` 沒有最大數量限制。若某些實體附帶大量標籤（如 workspace 的 scope 陣列），
Firestore `array-contains` 查詢的索引可能膨脹，影響查詢效能。

**建議修正方向**  
在 Domain Layer 或 Application Layer 定義標籤數量上限（如 `MAX_TAGS = 20`），
並在建立索引條目時截斷超量標籤。
