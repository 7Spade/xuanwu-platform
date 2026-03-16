# audit.module

**Bounded Context:** Audit Trail · Policy Automation / 稽核記錄 · 政策自動化  
**Layer:** SaaS (cross-cutting)

## Purpose

`audit.module` provides an immutable audit trail and policy automation layer.
It captures WHO did WHAT to WHICH artifact at WHAT time across all bounded contexts.

This module also owns the **`Sec` (Integrity & Policy Automation)** participant from
`core-logic.mermaid` — cross-module policy checks that were previously unassigned.

## What this module owns

| Concern | Description |
|---------|-------------|
| AuditEntry | Immutable, append-only record of a domain event |
| PolicyRule | Condition-based governance rule (e.g. required approvals before merge) |
| PolicyEvaluation | Deterministic pass/fail evaluation against active rules |
| ComplianceReport | Aggregated audit report for regulatory or internal review |

## Cross-module dependencies

| Module | Direction | Reason |
|--------|-----------|--------|
| All source modules | ← | Subscribes to domain events to record audit entries |
| `identity.module` | → | Actor identity resolved from IdentityId |
| `account.module` | → | Actor account handle resolved for display |
| `workspace.module` | → | Workspace governance rules (required approvals, QA sign-off) |
| `notification.module` | ← | PolicyViolationDetected triggers notification to workspace owner |

## Standard 4-layer structure

```
audit.module/
├── index.ts
├── domain.audit/
│   ├── _entity.ts               # AuditEntry (append-only) + PolicyRule + PolicyEvaluation
│   ├── _value-objects.ts        # AuditEntryId, AuditAction, ResourceRef, PolicyOutcome
│   ├── _ports.ts                # IAuditEntryRepository, IPolicyRuleRepository, IAuditEventSubscriber
│   └── _events.ts               # PolicyViolationDetected
├── core/
│   ├── _use-cases.ts            # EvaluatePolicyUseCase, GetAuditTrailUseCase, ExportAuditReportUseCase
│   ├── _actions.ts
│   └── _queries.ts
├── infra.firestore/
└── _components/
```

## Domain Governance（必填）

### 1. 上下文邊界（Bounded Context）
- 本模組邊界：**Audit / 稽核追蹤與政策事件**。
- 僅允許透過 `src/modules/audit.module/index.ts` 對外暴露能力；禁止跨模組直連 `core/`、`domain.*`、`infra.*`、`_components/`。

### 2. 核心域與支撐域識別
- 本模組定位：**支撐域**。
- 核心能力放在 `domain.*` + `core/`；跨域整合、通知、搜尋等配套能力視為支撐能力，由應用層編排。

### 3. 上下文映射（Context Mapping）
- 主要上下游關聯：**All modules、Search**。
- 跨上下文資料交換需使用 DTO／事件，不共享對方內部實體。

### 4. 防腐層（Anti-Corruption Layer）
- 外部系統（Firebase / Upstash / 外部 API）必須封裝在 `infra.*`。
- 使用 Mapper / Adapter 將外部資料格式轉換為本域 Value Object 與 Entity，避免污染領域模型。

### 5. 核心業務邏輯
- 不變條件（invariants）與規則放在 `domain.*`（Entity / VO / Domain Service）。
- `core/_use-cases.ts` 僅做流程協調：載入 → 套用規則 → 透過 Port 持久化 → 發布事件。

### 6. 操作流程
1. Presentation（`_components/` 或 `src/app`）呼叫模組公開 Action/Query。
2. Application（`core/`）執行用例並調用 Domain。
3. Domain 計算狀態變更與事件。
4. Infrastructure（`infra.*`）透過 Port 落地 I/O。

### 7. 模組間契約
- 同步契約：`index.ts` 匯出的 Action / Query / DTO。
- 非同步契約：Domain Event payload（版本化、向後相容）。
- 契約變更需先更新 README 與呼叫端，避免破壞既有流程。
