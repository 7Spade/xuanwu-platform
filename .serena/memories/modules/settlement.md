# settlement.module — File Index

**Bounded Context**: 財務結算 / Financial Settlement
**職責**: 結算記錄管理、請款流程、付款確認、7 段式財務生命週期（DRAFT→PENDING→CLAIMED→APPROVED→PAID→DISPUTED→CLOSED）。
**不包含**: 排班/指派（workforce.module）、帳號資料（account.module）。

---

## `index.ts`
**描述**: 公開 API barrel — 匯出 DTOs、用例函數及 Port 介面。
**函數清單**:
- `export type SettlementDTO` — 結算公開 DTO
- `export createSettlementRecord` — 建立結算記錄（DRAFT）
- `export submitClaim` — 提交請款申請（DRAFT→CLAIMED）
- `export approveClaim` — 核准請款（CLAIMED→APPROVED）
- `export recordPayment` — 記錄付款完成（APPROVED→PAID）
- `export getSettlementsByWorkspace` — 依工作空間查詢結算記錄
- `export type ISettlementRepository` — 結算 Repository Port 介面

---

## `core/_use-cases.ts`
**描述**: 財務結算生命週期用例，嚴格遵守 7 段式狀態機。
**函數清單**:
- `interface SettlementDTO` — 結算公開 DTO（id, workspaceId, role, stage, lineItems, totalAmount, currency）
- `createSettlementRecord(repo, params): Promise<Result<SettlementDTO>>` — 建立 DRAFT 結算記錄
- `submitClaim(repo, id): Promise<Result<SettlementDTO>>` — 提交請款（DRAFT→CLAIMED）
- `approveClaim(repo, id, approverId): Promise<Result<SettlementDTO>>` — 核准請款（CLAIMED→APPROVED）
- `recordPayment(repo, id, paymentRef): Promise<Result<SettlementDTO>>` — 記錄付款（APPROVED→PAID）
- `getSettlementsByWorkspace(repo, workspaceId): Promise<Result<SettlementDTO[]>>` — 查詢清單

---

## `core/_actions.ts`
**描述**: `'use server'` 薄包裝層，重新匯出寫入型用例。
**函數清單**:
- 重新匯出 `SettlementDTO`（型別）
- 重新匯出 `createSettlementRecord`、`submitClaim`、`approveClaim`、`recordPayment`

---

## `core/_queries.ts`
**描述**: 伺服器端唯讀查詢重新匯出。
**函數清單**:
- 重新匯出 `SettlementDTO`（型別）
- 重新匯出 `getSettlementsByWorkspace`

---

## `domain.settlement/_value-objects.ts`
**描述**: 財務結算 domain 的 Branded Types。
**函數清單**:
- `SettlementIdSchema` / `type SettlementId` — 結算唯一識別碼
- `FinanceLifecycleStageSchema` / `type FinanceLifecycleStage` — enum: `"DRAFT"|"PENDING"|"CLAIMED"|"APPROVED"|"PAID"|"DISPUTED"|"CLOSED"`
- `SettlementRoleSchema` / `type SettlementRole` — enum: `"accounts-receivable"|"accounts-payable"`
- `InvoiceAmountSchema` / `type InvoiceAmount` — 非負數金額（z.number().nonnegative）

---

## `domain.settlement/_entity.ts`
**描述**: `SettlementRecord` Aggregate Root，持有 ClaimLineItem 子聚合清單。
**不變式**:
- 狀態轉換必須依照 7 段式生命週期順序
- PAID 或 CLOSED 狀態不可再更改
**函數清單**:
- `interface ClaimLineItem` — 請款明細（description, quantity, unitPrice, total）
- `interface SettlementRecord` — Aggregate Root 結構（id, workspaceId, role, stage, lineItems, totalAmount, currency, createdAt）
- `buildSettlementRecord(params, now): SettlementRecord` — 建立 DRAFT 結算 entity

---

## `domain.settlement/_events.ts`
**描述**: Settlement Bounded Context 的 Domain Event 型別定義。
**函數清單**:
- `interface SettlementCreated` — 結算記錄建立事件
- `interface ClaimSubmitted` — 請款提交事件
- `interface ClaimApproved` — 請款核准事件
- `interface PaymentReceived` — 付款完成事件
- `interface SettlementCompleted` — 結算完成（CLOSED）事件
- `type SettlementDomainEventUnion` — 上述事件的 union type

---

## `domain.settlement/_ports.ts`
**描述**: Settlement domain 的 Port 介面定義。
**函數清單**:
- `interface ISettlementRepository` — 結算持久化（findById, findByWorkspace, save）

---

## `domain.settlement/_service.ts`
**描述**: Settlement Domain Service 規格說明。
**函數清單**:
- `DisputeResolutionService`（描述）— 爭議結算的調解流程邏輯
- `BatchSettlementService`（描述）— 批量結算記錄的閉帳處理

---

## `infra.firestore/_repository.ts`
**描述**: `ISettlementRepository` 的 Firestore 實作骨架。
**函數清單**: *(待實作，目前為佔位註解)*

---

## `infra.firestore/_mapper.ts`
**描述**: Firestore 文件 ↔ SettlementRecord 的雙向轉換。
**函數清單**: *(待實作，目前為佔位註解)*
