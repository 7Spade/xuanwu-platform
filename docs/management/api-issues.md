# API Issues / API 定義與契約問題報告

> 記錄 Port 介面設計缺陷、API 契約不完整、跨模組接口耦合，以及需要版本化的公開契約問題。

---

## API-001 `IAccountRepository.save()` 缺乏樂觀並發控制

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 高（🔴） |
| **受影響模組** | `account.module` |
| **受影響檔案** | `src/modules/account.module/domain.account/_ports.ts` |

**問題描述**  
`IAccountRepository` 的 `save(account): Promise<void>` 介面無版本控制參數，
無法實作樂觀並發控制（Optimistic Concurrency Control）。

對比 `ScheduleAssignment` 已有 `version: number`（monotonic version counter）但對應的
Port 介面中未見 `save(entity, expectedVersion)` 簽名。

在多個 Server Action 並行修改同一帳號（如同時接受邀請和更新 profile）時，存在 last-write-wins 問題。

**建議修正方向**  
```typescript
// 建議在 Port 介面中加入版本參數
interface IAccountRepository {
  findById(id: AccountId): Promise<AccountEntity | null>;
  findByHandle(handle: AccountHandle): Promise<AccountEntity | null>;
  save(account: AccountEntity, expectedVersion?: number): Promise<void>;
}
```

---

## API-002 `SearchIndexEntry.sourceModule` 使用 `string` 而非 union type

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 中（🟡） |
| **受影響模組** | `search.module` |
| **受影響檔案** | `src/modules/search.module/domain.search/_entity.ts` |
| **受影響欄位** | `sourceModule: string` |

**問題描述**  
`SearchIndexEntry` 中 `sourceModule: string` 是無約束字串，任何呼叫者都可以傳入任意值。
這使得以下情境無法在型別層面保護：
- 搜尋結果路由（根據 sourceModule 決定跳轉路徑）
- 索引更新（確保更新者是正確的模組）
- 空字串或錯誤模組名稱

**建議修正方向**  
定義一個共享 union type：
```typescript
// src/shared/types/index.ts
export type DomainModuleName =
  | "workspace.module"
  | "work.module"
  | "file.module"
  | "account.module"
  | "settlement.module"
  // ...其餘 16 個模組
```
並在 `SearchIndexEntry.sourceModule` 使用此 type。

---

## API-003 `AuditEntry.actor.accountHandle` 洩漏表現層概念至不可變稽核記錄

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 中（🟡） |
| **受影響模組** | `audit.module` |
| **受影響檔案** | `src/modules/audit.module/domain.audit/_entity.ts` |
| **受影響欄位** | `ActorRef.accountHandle: string \| null` |

**問題描述**  
`ActorRef`（稽核記錄的行為者參考）包含 `accountHandle: string | null`。
`AccountHandle` 是 URL slug，屬於表現/導航層概念，且用戶可能隨時變更。

由於 `AuditEntry` 是 **append-only（不可修改）**的不可變記錄，嵌入可變的 handle 會造成：
1. Handle 變更後，歷史 AuditEntry 顯示的是舊 handle（歷史失真）。
2. 若要修正歷史記錄，違反了 audit 的不可變性。

**建議修正方向**  
從 `ActorRef` 移除 `accountHandle`，僅保留不可變的 `identityId` 和 `accountId`。
若需顯示 handle，在查詢時（read side）動態 join account.module。

---

## API-004 `IAccountHandleAvailabilityPort` 與帳號建立之間存在 TOCTOU 競爭

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 高（🔴） |
| **受影響模組** | `account.module` |
| **受影響檔案** | `src/modules/account.module/domain.account/_ports.ts`, `core/_use-cases.ts` |

**問題描述**  
`createPersonalAccount` 用例流程：
1. 呼叫 `handlePort.isAvailable(handle)` — 檢查 handle 是否可用
2. 構建 `AccountEntity`
3. 呼叫 `repo.save(account)` — 儲存帳號

步驟 1 和 3 之間存在 **TOCTOU（Time-of-Check to Time-of-Use）** 競爭窗口。
兩個並發請求可能都通過步驟 1 的檢查，然後都嘗試在步驟 3 寫入相同 handle。

**建議修正方向**  
選擇其一：
1. 在 Firestore 層使用 transaction（`runTransaction`）來原子地檢查+寫入。
2. 使用 Firestore Security Rules 在 handle 路徑層面加唯一性約束。
3. 在 `IAccountRepository.save()` 中引入 unique constraint check 並拋出 `ConflictError`。

---

## API-005 `CausalNode.kind` 硬編碼跨模組類型字串

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 中（🟡） |
| **受影響模組** | `causal-graph.module` |
| **受影響檔案** | `src/modules/causal-graph.module/domain.causal-graph/_entity.ts` |
| **受影響欄位** | `CausalNodeKind` |

**問題描述**  
```typescript
export type CausalNodeKind =
  | 'work-item'
  | 'milestone'
  | 'cr'
  | 'qa'
  | 'baseline'
  | 'domain-event'
  | 'settlement'    // ← 直接引用 settlement.module 的概念
  | 'audit-entry';  // ← 直接引用 audit.module 的概念
```

`causal-graph.module` 的領域層直接嵌入其他模組的實體類型名稱（`'settlement'`, `'audit-entry'`），
造成 Domain → Domain 的直接耦合，違反模組邊界。

**建議修正方向**  
定義為事件驅動的開放類型，而非封閉的 union：
```typescript
// 允許任意字串，或定義一個標準化的 source kind 註冊機制
export type CausalNodeKind = string; // with validation at application layer
```
或通過 `causal-graph.module` 的 Port 介面允許外部模組注入 kind 值。

---

## API-006 模組公開 API（barrel）缺少版本標記

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 低（🟢） |
| **受影響模組** | 所有 16 個模組 |
| **受影響檔案** | 各 `index.ts` |

**問題描述**  
各模組 `index.ts` 的公開 API 沒有版本標記或變更日誌，
在重構 DTO 或新增/移除 Port 介面時，依賴方無法感知 breaking change。

**建議修正方向**  
在各模組 `index.ts` 頂部添加 `@version` JSDoc 標記，
並在 `README.md` 中維護 CHANGELOG 段落。
