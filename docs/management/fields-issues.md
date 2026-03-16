# Fields Issues / 欄位設計問題報告

> 記錄**欄位重疊、語意衝突、跨模組重複定義**，以及不符合領域純潔性的欄位設計問題。

---

## FIELD-001 財務計算欄位混入 Work Domain

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 高（🔴） |
| **受影響模組** | `work.module` |
| **受影響檔案** | `src/modules/work.module/domain.work/_entity.ts` |
| **受影響欄位** | `quantity`, `unitPrice`, `discount`, `subtotal` |

**問題描述**  
`WorkItemEntity` 包含以下財務欄位：

```typescript
readonly quantity?: number;
readonly unitPrice?: number;
readonly discount?: number;
/** Auto-computed: quantity × unitPrice − discount. Stored for fast reads. */
readonly subtotal?: number;
```

「工作項目（Work Item）」是施工計劃領域的概念，**不應承載財務計算責任**。  
財務邏輯（`quantity × unitPrice − discount`）屬於 `settlement.module` 的 `ClaimLineItem` 職責。

**衝突分析**

| 位置 | 欄位 | 備註 |
|------|------|------|
| `WorkItemEntity` | `quantity`, `unitPrice`, `discount`, `subtotal` | work domain |
| `ClaimLineItem` | `quantity`, `unitPrice`, `lineAmount` | settlement domain |
| `WorkspaceTask` | `quantity`, `unitPrice`, `subtotal` | workspace domain |

三處各自保存相同財務資料，且 `subtotal` 與 `lineAmount` 表示同一計算結果但命名不同。

**建議修正方向**  
1. 將 `WorkItemEntity` 的財務欄位提取為 settlement.module 可讀取的投影（Projection）或事件，而非嵌入 Entity。
2. 或將財務欄位移至一個明確命名的 Value Object（如 `PricingRecord`），附帶充足說明為何 work domain 需要此資訊。

---

## FIELD-002 三個不相容的 Location 結構體

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 高（🔴） |
| **受影響模組** | `work.module`, `workforce.module`, `workspace.module` |
| **受影響欄位** | `TaskLocation`, `ScheduleLocation`, `WorkspaceLocation` |

**問題描述**  
「地點」概念在三個模組中分別定義了不相容的介面：

```typescript
// work.module/domain.work/_entity.ts
export interface TaskLocation {
  readonly building?: string;
  readonly floor?: string;
  readonly room?: string;
  readonly description?: string;
}

// workforce.module/domain.workforce/_entity.ts
export interface ScheduleLocation {
  readonly building?: string;
  readonly floor?: string;
  readonly room?: string;
  readonly description: string;  // ← required (不同!)
}

// workspace.module/domain.workspace/_entity.ts
export interface WorkspaceLocation {
  readonly locationId: string;   // ← 有 ID
  readonly label: string;        // ← 用 label 而非 name
  readonly type?: "building" | "floor" | "room";
  readonly parentId?: string;    // ← 支援層級關係
  readonly description?: string;
  readonly capacity?: number;    // ← 額外欄位
}
```

三者結構不相容，無法互操作。若 work.module 的工作項目被指派在 workspace 的某個 Location 下，
兩者無法直接關聯。

**建議修正方向**  
1. 在 `src/shared/interfaces/` 或 workspace.module 公開介面中定義一個 `LocationRef` Value Object，
   其他模組透過 `locationId: string` 引用 `WorkspaceLocation`。
2. 廢棄 `TaskLocation` 和 `ScheduleLocation`，改用 `locationId` 引用。

---

## FIELD-003 `ScheduleAssignment` 同時持有兩個 location 欄位

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 中（🟡） |
| **受影響模組** | `workforce.module` |
| **受影響檔案** | `src/modules/workforce.module/domain.workforce/_entity.ts` |
| **受影響欄位** | `location?: ScheduleLocation`, `locationId?: string` |

**問題描述**  
`ScheduleAssignment` 同時含有：
- `location?: ScheduleLocation` — 嵌入式完整地點物件
- `locationId?: string` — 對 workspace location 的引用 ID

兩者可能存在不一致（locationId 指向的 WorkspaceLocation 與嵌入的 ScheduleLocation 資料不符）。

**建議修正方向**  
選擇其一設計模式：
- **Referential（建議）**：僅保留 `locationId?: string`，去掉嵌入的 `ScheduleLocation`。
- **Embedded**：僅保留 `location?: ScheduleLocation`，但需說明與 WorkspaceLocation 的關係。

---

## FIELD-004 `ClaimLineItem.lineAmount` vs `WorkspaceTask.subtotal` vs `WorkItemEntity.subtotal`

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 中（🟡） |
| **受影響模組** | `settlement.module`, `workspace.module`, `work.module` |
| **受影響欄位** | `lineAmount`, `subtotal` |

**問題描述**  
同一計算邏輯（`quantity × unitPrice − discount`）在三個模組中以不同欄位名儲存：

| 位置 | 欄位名 | 公式 |
|------|--------|------|
| `ClaimLineItem` | `lineAmount` | `quantity × unitPrice` |
| `WorkspaceTask` | `subtotal` | `quantity × unitPrice`（無 discount） |
| `WorkItemEntity` | `subtotal` | `quantity × unitPrice − discount` |

命名不統一（`lineAmount` vs `subtotal`），且計算公式也有差異（discount 是否納入）。

**建議修正方向**  
統一使用 `lineAmount`（更接近財務術語）或 `subtotal`（更接近商業語境），並確保各處公式一致。

---

## FIELD-005 `WorkspaceTask.name` vs `WorkItemEntity.title` — 同一概念不同欄位名

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 低（🟢） |
| **受影響模組** | `workspace.module`, `work.module` |
| **受影響欄位** | `WorkspaceTask.name`, `WorkItemEntity.title` |

**問題描述**  
兩個代表「任務名稱」的欄位使用不同命名：
- `WorkspaceTask.name: string` （workspace.module）
- `WorkItemEntity.title: string` （work.module）

這在搜尋索引、事件 payload 及 UI 元件中會造成混淆。

**建議修正方向**  
統一為 `title`（與 `SearchIndexEntry.title` 保持一致）。

---

## FIELD-006 `WorkspaceEntity.dimensionId` vs `ScheduleAssignment.accountId` — 同義不同名

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 中（🟡） |
| **受影響模組** | `workspace.module`, `workforce.module` |
| **受影響欄位** | `dimensionId`, `accountId` |

**問題描述**  
兩個欄位都代表「擁有此聚合根的組織帳號 ID」，但命名不同：
- `WorkspaceEntity.dimensionId: string` — 「the owning account's id」
- `ScheduleAssignment.accountId: string` — 「org account owning this assignment」

**建議修正方向**  
統一命名（建議 `ownerAccountId`），並在 Glossary 說明此欄位的一致語意。

---

## FIELD-007 `MembershipRecord` 時間欄位命名不一致

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 低（🟢） |
| **受影響模組** | `account.module` |
| **受影響欄位** | `invitedAt`, `acceptedAt`, `createdAt`, `updatedAt` |

**問題描述**  
`MembershipRecord` 使用了：
- `invitedAt: string` — 事件時間點（動詞+At）
- `acceptedAt: string | null` — 事件時間點（動詞+At）

而其他模組（如 `WorkspaceEntity`）統一使用 `createdAt / updatedAt`。
若未來需要審計邀請歷史，動詞+At 命名更清晰；但若要與通用 audit 機制整合，可能需要對齊。

**建議修正方向**  
在 Glossary 確立時間欄位命名規範：
- `createdAt / updatedAt` — 所有聚合根的標準建立/更新時間
- `{event}At` — 特定領域事件的發生時間（如 `invitedAt`, `acceptedAt`）
