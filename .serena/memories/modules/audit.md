# audit.module — File Index

**Bounded Context**: 稽核 / Audit Trail
**職責**: Append-only 稽核日誌、資源操作記錄、政策執行結果追蹤。
**設計原則**: AuditEntry 是不可變的（immutable）— 只能新增，不可修改或刪除。
**不包含**: 帳號角色資料（account.module）、通知（notification.module）。

---

## `index.ts`
**描述**: 公開 API barrel — 匯出 DTOs、用例函數及 Port 介面。
**函數清單**:
- `export type AuditEntryDTO` — 稽核條目公開 DTO
- `export recordAuditEntry` — 新增稽核記錄（只寫）
- `export getAuditLogByResource` — 依資源查詢稽核日誌
- `export getAuditLogByWorkspace` — 依工作空間查詢稽核日誌
- `export type IAuditRepository` — 稽核 Repository Port 介面

---

## `core/_use-cases.ts`
**描述**: 稽核記錄新增與查詢用例。新增操作不可回滾。
**函數清單**:
- `interface AuditEntryDTO` — 稽核條目公開 DTO（id, actor, resource, action, outcome, metadata, occurredAt）
- `recordAuditEntry(repo, params): Promise<Result<void>>` — 新增稽核記錄
- `getAuditLogByResource(repo, resourceType, resourceId, options): Promise<Result<AuditEntryDTO[]>>` — 依資源查詢
- `getAuditLogByWorkspace(repo, workspaceId, options): Promise<Result<AuditEntryDTO[]>>` — 依工作空間查詢

---

## `core/_actions.ts`
**描述**: `'use server'` 薄包裝層，重新匯出寫入型用例。
**函數清單**:
- 重新匯出 `AuditEntryDTO`（型別）
- 重新匯出 `recordAuditEntry`

---

## `core/_queries.ts`
**描述**: 伺服器端唯讀查詢重新匯出。
**函數清單**:
- 重新匯出 `AuditEntryDTO`（型別）
- 重新匯出 `getAuditLogByResource`、`getAuditLogByWorkspace`

---

## `domain.audit/_value-objects.ts`
**描述**: 稽核 domain 的 Branded Types。
**函數清單**:
- `AuditEntryIdSchema` / `type AuditEntryId` — 稽核條目唯一識別碼
- `AuditActionSchema` / `type AuditAction` — 操作類型 enum（create/read/update/delete/login/logout/export 等）
- `PolicyOutcomeSchema` / `type PolicyOutcome` — 政策評估結果 enum: `"pass"|"fail"|"blocked"`

---

## `domain.audit/_entity.ts`
**描述**: `AuditEntry` 不可變記錄，代表一個稽核事件快照。
**設計說明**: entity 不包含 update 方法，所有欄位皆為 `readonly`。
**函數清單**:
- `interface ActorRef` — 操作者參考（actorId, actorType, displayName）
- `interface ResourceRef` — 資源參考（resourceId, resourceType, resourceLabel）
- `interface AuditEntry` — 不可變稽核條目（id, actor, resource, workspaceId, action, outcome, ipAddress, metadata, occurredAt）
- `buildAuditEntry(params, now): AuditEntry` — 建立稽核條目快照

---

## `domain.audit/_events.ts`
**描述**: Audit Bounded Context 的 Domain Event 型別定義。
**函數清單**: *(稽核本身即為事件記錄，目前無對外 Domain Events)*

---

## `domain.audit/_ports.ts`
**描述**: Audit domain 的 Port 介面定義。
**函數清單**:
- `interface IAuditRepository` — 稽核日誌持久化（append, findByResource, findByWorkspace）— 不提供 update/delete 方法

---

## `domain.audit/_service.ts`
**描述**: Audit Domain Service 規格說明。
**函數清單**:
- `AuditRetentionService`（描述）— 依保留政策歸檔舊稽核記錄（冷儲存）
- `PolicyEvaluationService`（描述）— 評估操作是否符合政策並記錄結果

---

## `infra.firestore/_repository.ts`
**描述**: `IAuditRepository` 的 Firestore 實作骨架（Append-only，使用 addDoc 而非 setDoc）。
**函數清單**: *(待實作，目前為佔位註解)*

---

## `infra.firestore/_mapper.ts`
**描述**: Firestore 文件 ↔ AuditEntry 的映射（只需單向：Firestore→DTO，因為寫入直接使用 entity 結構）。
**函數清單**: *(待實作，目前為佔位註解)*
