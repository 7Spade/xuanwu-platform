# ADR-010: Status Field Semantic Disambiguation and Lifecycle Naming Convention

**Date**: 2026-03-16  
**Status**: Proposed  
**Source**: `docs/management/semantics-issues.md` — SEM-001, SEM-006

---

## Context

The `status` field name is used across at least four modules with completely different semantics:

| Location | Type | Value Domain | Semantic |
|----------|------|--------------|----------|
| `WorkspaceGrant.status` | `"active" \| "revoked" \| "expired"` | Access control state | 存取授權狀態 |
| `MembershipRecord.status` | `"pending" \| "active" \| "revoked"` | Membership lifecycle (incl. invitation) | 成員資格狀態 |
| `WorkItemEntity.status` | `WorkItemStatus` | Work progress | 工作項目進度 |
| `ScheduleAssignment.status` | `ScheduleStatus` | Approval state | 排班核准狀態 |
| `ForkEntity.status` | `ForkStatus` | Fork lifecycle | Fork 生命週期 |

Furthermore, the concept of "current lifecycle state" is expressed with three different field names across the codebase:

| Field Name | Usage Site |
|------------|-----------|
| `progressState` | `WorkspaceTask.progressState: TaskState` |
| `lifecycleState` | `WorkspaceEntity.lifecycleState: WorkspaceLifecycleState` |
| `status` | `WorkItemEntity.status`, `ForkEntity.status`, `MembershipRecord.status` |
| `stage` | `SettlementRecord.stage: FinanceLifecycleStage` |

This ambiguity violates the **Ubiquitous Language** principle (MDHA §2.2): the same word carries different meanings in different Bounded Contexts, and even within a single module's domain model, the lifecycle concept is expressed inconsistently.

Generic cross-cutting modules (`audit.module`, `search.module`) cannot reliably interpret `status` fields when aggregating data from multiple sources. Automated tooling or AI-assisted queries may confuse `active` membership with `active` access grants.

---

## Decision

### 1. Rename overloaded `status` fields to context-specific names

| Current | Renamed | Rationale |
|---------|---------|-----------|
| `WorkspaceGrant.status` | `WorkspaceGrant.grantStatus` | Disambiguates access-control grant state |
| `MembershipRecord.status` | `MembershipRecord.membershipStatus` | Disambiguates membership lifecycle state |
| `WorkItemEntity.status` | (retain) | Already has dedicated `WorkItemStatus` type; semantics are clear |
| `ScheduleAssignment.status` | (retain or rename to `approvalStatus`) | Evaluated in ADR for `workforce.module` refinement |
| `ForkEntity.status` | (retain) | Already has dedicated `ForkStatus` type; semantics are clear |

### 2. Establish canonical lifecycle naming rules in `docs/architecture/glossary/technical-terms.md`

| Field convention | When to use | Example |
|------------------|-------------|---------|
| `status` | Current state snapshot; reversible transitions | `WorkItemEntity.status: WorkItemStatus` |
| `stage` | Linear, irreversible process phase | `SettlementRecord.stage: FinanceLifecycleStage` |
| `lifecycleState` | Overall lifecycle of an Aggregate Root | `WorkspaceEntity.lifecycleState: WorkspaceLifecycleState` |
| `{context}Status` | Disambiguated status when `status` would clash | `grantStatus`, `membershipStatus` |

### 3. Deprecate `progressState`

`WorkspaceTask.progressState: TaskState` should be renamed to `WorkspaceTask.status: TaskState` to align with the canonical convention for reversible task states.

---

## Consequences

**Positive**:
- Removes semantic ambiguity for cross-module consumers (`audit.module`, `search.module`, AI-assisted queries).
- Aligns field names with Ubiquitous Language as defined in `docs/architecture/glossary/`.
- Reduces cognitive load for developers working across module boundaries.

**Negative / Trade-offs**:
- `WorkspaceGrant.grantStatus` and `MembershipRecord.membershipStatus` are breaking changes to Firestore document schemas and all TypeScript consumers.
- All callers of `WorkspaceGrant` and `MembershipRecord` must be updated.
- Existing Firestore documents in production must be migrated (field rename or dual-write period).

**Context Mapping impact**:
- `audit.module` (Downstream / Conformist): must update its `AuditEntry.resource` interpretation for renamed fields.
- `search.module` (Downstream / Conformist): `SearchIndexEntry` metadata that stores grant/membership status must be updated.

---

## Alternatives Considered

1. **Keep all field names as-is**: Rejected. The current naming causes model rot; cross-module tools cannot reliably interpret `status` fields without hard-coded per-source logic.
2. **Namespace all status fields** (e.g. `workspace__grant_status`): Rejected. Verbose; not idiomatic TypeScript.
3. **Use a `kind` discriminator** on a shared `StatusRecord` value object: Rejected. Adds indirection without solving the naming ambiguity at the field level.

---

## References

- MDHA §2.2 Ubiquitous Language: `docs/architecture/notes/model-driven-hexagonal-architecture.md`
- MDHA §2.5 Invariants: enforcing correct state representations is part of domain invariant enforcement
- Glossary: `docs/architecture/glossary/technical-terms.md`
- Source issues: `docs/management/semantics-issues.md` (SEM-001, SEM-006) — translated to this ADR and removed
