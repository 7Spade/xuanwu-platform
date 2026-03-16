# Integration Issues / 系統整合問題報告

> 記錄跨模組依賴、第三方服務整合、資料同步，以及模組邊界被侵蝕的整合問題。

---

## INT-001 `IdentityRecord.accountId` 可為 null 導致 Identity-Account 連結競爭條件

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 高（🔴） |
| **受影響模組** | `identity.module`, `account.module` |
| **受影響檔案** | `src/modules/identity.module/domain.identity/_entity.ts` |
| **受影響欄位** | `IdentityRecord.accountId: string \| null` |

**問題描述**  
`IdentityRecord.accountId` 在帳號完成建立前為 `null`（「set after account provisioning」）。
這產生一個可觀察的時間窗口：

```
用戶透過 Firebase Auth 登入
  → IdentityRecord 建立（accountId = null）
     → Server Action 嘗試建立 AccountEntity
        → 若 Server Action 失敗：IdentityRecord.accountId 永久為 null
```

在此窗口內：
1. 已認證的用戶請求可能因 `accountId = null` 而被錯誤拒絕。
2. 若 AccountEntity 建立失敗，用戶無法再次觸發建立流程（無冪等機制）。

**建議修正方向**  
1. 在 `identity.module` 的 Application Layer 定義 `provisionAccount()` use case，
   使用 Firestore Transaction 原子地建立 `IdentityRecord` 和 `AccountEntity`。
2. 或在 `onAuthStateChanged` 觸發時，始終檢查並補建缺失的 AccountEntity（idempotent 補建）。

---

## INT-002 `achievement.module` → `account.module` 的 Port 造成跨 BC 直接依賴

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 高（🔴） |
| **受影響模組** | `achievement.module`, `account.module` |
| **受影響檔案** | `src/modules/account.module/domain.account/_ports.ts` |
| **受影響欄位** | `IAccountBadgeWritePort.writeAchievement()` |

**問題描述**  
`account.module` 的 Domain Layer 定義了 `IAccountBadgeWritePort`，
而 `FirestoreAccountRepository`（account.module 的 Infrastructure）同時實作此介面，
讓 `achievement.module` 可以調用以寫入 badge。

這個設計造成：
- `achievement.module`（Domain）→ `account.module`（Infrastructure）的跨 BC 依賴。
- 若 account.module 的 Firestore schema 變更，achievement.module 的 port 調用可能靜默失效。
- Badge 寫入沒有事件溯源，無法稽核「哪個 achievement rule 觸發了 badge 解鎖」。

**建議修正方向**  
採用事件驅動整合：
1. `achievement.module` 發布 `AchievementUnlocked` Domain Event。
2. `account.module` 訂閱此事件，在自己的 Application Layer 更新 `AccountEntity.profile.badgeSlugs`。
3. 移除 `IAccountBadgeWritePort`，由 Event Bus 取代直接 Port 調用。

---

## INT-003 `CausalNode.kind` 硬編碼跨模組實體名稱

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 中（🟡） |
| **受影響模組** | `causal-graph.module` |
| **受影響檔案** | `src/modules/causal-graph.module/domain.causal-graph/_entity.ts` |

**問題描述**  
```typescript
export type CausalNodeKind =
  | 'work-item' | 'milestone' | 'cr' | 'qa' | 'baseline'
  | 'domain-event' | 'settlement' | 'audit-entry';
```

`causal-graph.module` 的 **Domain Layer** 直接硬編碼了來自其他模組的實體名稱。
這違反了模組隔離原則：若 `settlement.module` 將實體重命名或分裂，
`causal-graph.module` 的 Domain 定義需要同步更改。

**建議修正方向**  
見 `api-issues.md → API-005` 的詳細修正建議。

---

## INT-004 Namespace-Account 同步機制缺乏明確的整合合約

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 高（🔴） |
| **受影響模組** | `namespace.module`, `account.module` |
| **受影響檔案** | `domain.account/_entity.ts`, `domain.namespace/_entity.ts` |

**問題描述**  
架構定義了不變量：
> _「Account.handle must be kept in sync with the namespace slug owned by this account.」_

但沒有定義：
1. `AccountHandle` 變更時，哪個模組負責更新 `NamespaceEntity.slug`？
2. 兩個更新是否需要在同一 Firestore transaction 中完成？
3. 若其中一個更新失敗，如何回滾？

事件目錄（`event-catalog.md`）中應有對應的 `AccountHandleChanged` → `NamespaceSlugUpdated` 事件流，
但目前無法在事件目錄中確認此流程是否已定義。

**建議修正方向**  
1. 在 `docs/architecture/catalog/event-catalog.md` 中明確定義：
   `account:handle:changed` → `namespace:slug:updated` 的事件鏈。
2. 在 `namespace.module/core/_use-cases.ts` 中定義 `syncNamespaceSlug()` use case，
   訂閱 `AccountHandleChanged` 事件並原子地更新 Namespace。

---

## INT-005 `SearchIndexEntry` 未定義索引建立觸發機制

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 中（🟡） |
| **受影響模組** | `search.module` |
| **受影響檔案** | `src/modules/search.module/domain.search/_entity.ts` |

**問題描述**  
`SearchIndexEntry` 的 `indexedAt` 欄位記錄了索引時間，
但沒有定義：
1. 哪些模組的哪些 Domain Event 會觸發搜尋索引更新？
2. 索引更新是同步還是非同步（Event-driven）？
3. 索引失敗時如何補救（`tombstoning` 機制提及但未定義）？

**建議修正方向**  
在 `docs/architecture/catalog/event-catalog.md` 定義：
- 各模組中觸發搜尋索引更新的事件清單
- 索引更新的非同步 pattern（Queue → search.module Handler）

---

## INT-006 `AuditEntry` 建立後無事件發布，稽核不可觀察

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 低（🟢） |
| **受影響模組** | `audit.module` |

**問題描述**  
`audit.module` 接收其他模組的事件並建立 `AuditEntry`，但 `audit.module` 本身不發布任何 Domain Event。
若外部系統（如安全監控）需要實時感知稽核記錄的建立，目前沒有可訂閱的介面。

**建議修正方向**  
根據業務需求決定是否需要 `AuditEntryCreated` 事件，
若需要，定義相應的 Domain Event 和 Port（如 `IAuditEventPublisher`）。
