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
