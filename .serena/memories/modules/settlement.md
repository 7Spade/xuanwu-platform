# settlement.module — File Index

**Bounded Context**: 財務結算 / Financial Settlement
**職責**: 結算記錄管理、請款流程、付款確認、7 段式財務生命週期（claim-preparation → claim-submitted → claim-approved → invoice-requested → payment-term → payment-received → completed）。
**不包含**: 排班/指派（workforce.module）、帳號資料（account.module）。

---

## `index.ts`
**描述**: 公開 API barrel — 匯出 DTOs、用例函數及 Port 介面。
**函數清單**:
- `export type SettlementDTO` — 結算公開 DTO
- `export createSettlementRecord` — 建立結算記錄
- `export submitClaim` — 提交請款申請
- `export approveClaim` — 核准請款
- `export recordPayment` — 記錄付款完成
- `export getSettlementsByWorkspace` — 依工作空間查詢結算記錄
- `export type ISettlementRepository` — 結算 Repository Port 介面

---

## `core/_use-cases.ts`
**描述**: 財務結算生命週期用例，嚴格遵守 7 段式狀態機。
**函數清單**:
- `interface SettlementDTO` — 結算公開 DTO
- `createSettlementRecord(repo, params)` — 建立結算記錄
- `submitClaim(repo, id)` — 提交請款
- `approveClaim(repo, id, approverId)` — 核准請款
- `recordPayment(repo, id, paymentRef)` — 記錄付款
- `getSettlementsByWorkspace(repo, workspaceId)` — 查詢清單

---

## `core/_actions.ts`
**描述**: `'use server'` 薄包裝層，重新匯出寫入型用例。
**函數清單**: 重新匯出 `SettlementDTO`、`createSettlementRecord`、`submitClaim`、`approveClaim`、`recordPayment`

---

## `core/_queries.ts`
**描述**: 伺服器端唯讀查詢重新匯出。
**函數清單**: 重新匯出 `SettlementDTO`、`getSettlementsByWorkspace`

---

## `domain.settlement/_value-objects.ts`
**描述**: 財務結算 domain 的 Branded Types。
**函數清單**:
- `SettlementIdSchema` / `type SettlementId`
- `FinanceLifecycleStageSchema` / `type FinanceLifecycleStage` — enum 7 stages
- `SettlementRoleSchema` / `type SettlementRole` — `"accounts-receivable" | "accounts-payable"`
- `InvoiceAmountSchema` / `type InvoiceAmount`

---

## `domain.settlement/_entity.ts`
**描述**: `SettlementRecord` Aggregate Root + `ClaimLineItem` 子文件。
**函數清單**:
- `interface ClaimLineItem` — 請款明細（itemId, name, quantity, unitPrice, lineAmount）
- `interface SettlementRecord` — Aggregate Root（id, workspaceId, dimensionId, role, stage, cycleIndex, contractAmount, receivedAmount, currentClaimLineItems, paymentTermStartAt, paymentReceivedAt, createdAt, updatedAt）
- `buildSettlementRecord(id, workspaceId, dimensionId, role, contractAmount, now): SettlementRecord`

---

## `domain.settlement/_events.ts`
**描述**: Settlement Bounded Context Domain Event union type。
**函數清單**:
- `interface SettlementCreated`
- `interface ClaimSubmitted`
- `interface ClaimApproved`
- `interface PaymentReceived`
- `interface SettlementCompleted`
- `type SettlementDomainEventUnion`

---

## `domain.settlement/_ports.ts`
**描述**: Settlement domain Port 介面。
**函數清單**:
- `interface ISettlementRepository` — `findById`, `findByWorkspaceId`, `findByDimensionId`, `save`, `deleteById`

---

## `domain.settlement/_service.ts` ✅ Wave 12
**描述**: Settlement Domain Service — 純函式，無 I/O。SettlementCalculationService + FinanceLifecycleFSM + ReconciliationService。
**函數清單**:
- `interface SettlementSummary` — `{ recordCount, totalContractAmount, totalReceivedAmount, outstandingAmount }`
- `interface ReconciliationResult` — `{ matched, discrepancy, requiresManualReview }`
- `VALID_STAGE_TRANSITIONS` — `Record<FinanceLifecycleStage, FinanceLifecycleStage[]>` strictly forward-only FSM (no backward transitions)
- `calculateSettlementSummary(records: readonly SettlementRecord[]): SettlementSummary`
- `isSettlementComplete(record): boolean`
- `computeOutstandingAmount(contractAmount, receivedAmount): number`
- `canAdvanceStage(record, nextStage): boolean`
- `reconcilePayment(record, paymentAmount, tolerancePct?): ReconciliationResult`

---

## `infra.firestore/_mapper.ts` ✅ Wave 12
**描述**: Firestore 文件 ↔ SettlementRecord 的雙向轉換。
**函數清單**:
- `interface ClaimLineItemDoc`
- `interface SettlementDoc`
- `settlementDocToEntity(d: SettlementDoc): SettlementRecord`
- `settlementEntityToDoc(e: SettlementRecord): SettlementDoc`

---

## `infra.firestore/_repository.ts` ✅ Wave 12
**描述**: `ISettlementRepository` 的 Firestore Web SDK 實作。
**函數清單**:
- `class FirestoreSettlementRepository implements ISettlementRepository`
  - `findById(id: SettlementId): Promise<SettlementRecord | null>`
  - `findByWorkspaceId(workspaceId: string): Promise<SettlementRecord[]>`
  - `findByDimensionId(dimensionId: string): Promise<SettlementRecord[]>`
  - `save(record: SettlementRecord): Promise<void>`
  - `deleteById(id: SettlementId): Promise<void>`

## `_components/billing-view.tsx` *(Wave 20)*
**描述**: 帳單/訂閱設定頁（`/[slug]/settings/billing`）— 目前方案卡片 + 用量條 shell，Wave 23 接 Firestore 資料。
**Export**: `BillingView` — 用於 `app/(main)/[slug]/settings/billing/page.tsx`
