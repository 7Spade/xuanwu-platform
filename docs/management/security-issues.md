# Security Issues / 安全問題報告

> 記錄權限控制缺陷、驗證漏洞、資料暴露風險，以及未強制執行的安全不變量。

---

## SEC-002 `AuditEntry` 工廠函數預設 `outcome: "success"`

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 中（🟡） |
| **受影響模組** | `audit.module` |
| **受影響檔案** | `src/modules/audit.module/domain.audit/_entity.ts` |

**問題描述**  
`buildAuditEntry()` 工廠函數硬編碼了 `outcome: "success"`：

```typescript
export function buildAuditEntry(...): AuditEntry {
  return {
    ...
    outcome: "success",  // ← 呼叫者無法傳入 "blocked"
  };
}
```

但 `AuditEntry.outcome` 的型別為 `"success" | "blocked"`，設計上應支援兩種結果。
若呼叫者忘記在事後更新 `outcome`，「被阻擋的操作」可能被記錄為「成功」。

**建議修正方向**  
將 `outcome` 改為工廠函數的必填參數：
```typescript
export function buildAuditEntry(
  ...,
  outcome: "success" | "blocked",  // ← 必填，強制呼叫者明確指定
): AuditEntry
```

---

## SEC-003 `AuthClaims` 中的 JWT Custom Claims 無文件化的輪換策略

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 中（🟡） |
| **受影響模組** | `identity.module` |
| **受影響檔案** | `src/modules/identity.module/domain.identity/_value-objects.ts` |
| **受影響欄位** | `AuthClaims.accountType`, `AuthClaims.accountId`, `AuthClaims.role` |

**問題描述**  
Firebase JWT Custom Claims（`accountId`, `accountType`, `role`）在 Token 有效期（最長 1 小時）內是不可變的。
若用戶的 `accountType` 從 personal 升級為 organization，或 `role` 被撤銷，
用戶持有的現有 Token 仍攜帶舊的 claims，直到 Token 過期。

目前沒有文件定義：
1. Claims 更新後，客戶端何時必須強制刷新 Token？
2. 是否有 Server Action 層的實時 Claims 驗證機制？

**建議修正方向**  
1. 在 `docs/architecture/notes/` 或 `docs/copilot/` 中定義 Claims 輪換策略：
   - 每次敏感操作（如 membership 變更）前，Server Action 必須調用 Firebase Admin SDK 重新驗證 Token。
   - 客戶端在 role 變更後立即強制 `user.getIdToken(true)` 刷新。
2. 考慮在 Firestore Security Rules 中使用 Firestore 實時查詢補充 JWT Claims 驗證。

---

## SEC-004 `WorkspaceVisibility.hidden` 無存取控制語意強制

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 中（🟡） |
| **受影響模組** | `workspace.module` |
| **受影響欄位** | `visibility: "visible" \| "hidden"` |

**問題描述**  
`WorkspaceEntity.visibility` 有 `"hidden"` 值，但 Domain Layer 沒有任何函數將 `visibility === "hidden"` 轉化為存取控制行為。

`hasWorkspaceAccess()` 函數只考慮 grants 和 team memberships，不考慮 visibility：

```typescript
// ← 如果 visibility === "hidden"，匿名訪問仍可能通過 hasTeamGrant？
export function hasWorkspaceAccess(workspace, userId, userTeamIds): boolean {
  return hasDirectGrant(workspace, userId) || hasTeamGrant(workspace, userTeamIds);
}
```

**安全風險**  
「hidden」workspace 可能仍然可以被有 team membership 的用戶直接訪問，
而「hidden」的預期語意（如：不在搜尋/清單中出現，但具備存取授權的人可訪問）未被明確定義和執行。

**建議修正方向**  
1. 在 `docs/architecture/glossary/business-terms.md` 明確定義 `visibility: "hidden"` 的存取語意。
2. 若 `"hidden"` 表示「不在公開清單出現，但有授權者可訪問」，則 `hasWorkspaceAccess()` 邏輯正確，
   只需確保 Search Index 的 `IndexEntryVisibility` 正確過濾。
3. 若 `"hidden"` 有更嚴格的語意，在 `hasWorkspaceAccess()` 中加入 visibility 前置檢查。

---

## SEC-005 `IAccountHandleAvailabilityPort` TOCTOU 競爭

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 高（🔴） |
| **受影響模組** | `account.module` |

**問題描述**  
見 `api-issues.md → API-004` 的詳細描述。Handle 唯一性檢查與帳號建立之間的競爭窗口
可能導致兩個用戶搶到相同的 handle，造成資料一致性問題。

此為同時屬於 API 設計和安全問題的交叉議題。

---

## SEC-006 `SettlementRecord.contractAmount` 無上限約束

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 低（🟢） |
| **受影響模組** | `settlement.module` |
| **受影響欄位** | `contractAmount: number`, `receivedAmount: number` |

**問題描述**  
`contractAmount` 是純 `number` 型別，沒有正數驗證（防止負數合約金額）和上限約束。
應用層若驗證不足，可能允許寫入異常大或負數的合約金額。

**建議修正方向**  
在 `settlement.module/domain.settlement/_value-objects.ts` 定義：
```typescript
export const ContractAmountSchema = z.number().positive("Contract amount must be positive");
export type ContractAmount = z.infer<typeof ContractAmountSchema>;
```
並在 `buildSettlementRecord` 工廠函數中使用此 schema 驗證。
---

## SEC-007 Firestore Security Rules 未覆蓋實際使用的 Collections

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 高（🔴） |
| **受影響模組** | `identity.module`, `account.module`, all modules writing to Firestore |
| **受影響檔案** | `firestore.rules` |

**問題描述**
`firestore.rules` 目前僅允許 `/users/{userId}` 路徑的讀寫（用於自身資料），其他所有 Collection 均被 catch-all deny 規則拒絕。

但程式碼實際使用的 Collections 包括：
- `identities`（`identity.module`）
- `accounts`（`account.module`）
- `workspaces`, `wbs_tasks`, `issues`, `change_requests`（`workspace.module`）
- `namespaces`, `teams`, `settlements`, `audit_log` 等

**安全風險**
若目前依賴 Firebase Admin SDK（不受 Security Rules 限制）進行所有後端寫入，則 Rules 寬鬆並不直接導致資料外洩。但若任何客戶端 SDK 路徑繞過了 Admin SDK，這些 Collections 的所有操作均會被 deny，且無細粒度的權限控制。

**建議修正方向**
參照 `docs/architecture/catalog/service-boundary.md` §「Firestore Security Rules Strategy」中的目標規則表，為每個 Collection 實作對應的 Firestore Security Rules。

---

> **已轉譯為 ADR 的問題** / Issues translated to ADRs:
> - SEC-001 → [ADR-011](../architecture/adr/20260316-workspace-grant-expiry-invariant.md): WorkspaceGrant expiry domain invariant enforcement
