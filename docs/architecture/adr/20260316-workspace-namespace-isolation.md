# ADR-012: Workspace-Namespace Isolation — `dimensionId` Rename and `AccountHandle`↔`NamespaceSlug` Coupling

**Date**: 2026-03-16  
**Status**: Proposed  
**Source**: `docs/management/semantics-issues.md` — SEM-003, SEM-005

---

## Context

### Issue A — `dimensionId` is not Ubiquitous Language

The field `dimensionId` appears in at least three modules as a reference to the owning account's ID:

| Location | Documented meaning | Current field name |
|----------|--------------------|--------------------|
| `WorkspaceEntity.dimensionId` | "the owning account's id" | `dimensionId` |
| `SettlementRecord.dimensionId` | (undocumented) | `dimensionId` |
| `WorkforceEntity.dimensionId` | (inferred) owning org account ID | `dimensionId` |

Meanwhile, `ScheduleAssignment.accountId` also means "org account owning this assignment" — identical semantics but a different field name.

**"Dimension" is not a business term** and does not appear in `docs/architecture/glossary/`. It is an internal technical concept from an early design phase ("account dimension") that was never formalised as Ubiquitous Language. Its presence violates MDHA §2.2 (Ubiquitous Language), which requires that field names in domain entities match the glossary terms used by domain experts.

### Issue B — `AccountHandle` ↔ `NamespaceSlug` coupling lacks type-level enforcement

The MDHA explicitly states:

> _"Account.handle must be kept in sync with the namespace slug owned by this account."_

In code:
- `AccountHandle` is a Branded Type defined in `account.module/domain.account/_value-objects.ts`
- `NamespaceSlug` is a Branded Type defined in `namespace.module/domain.namespace/_value-objects.ts`

Both represent the same URL-safe identifier (lowercase alphanumeric + hyphens + underscores), but they are defined as separate types with no compile-time isomorphism guarantee. The synchronization contract is maintained only by application-layer conventions and Firestore write ordering — not by the type system.

This creates a **semantic drift risk**: if the two schemas diverge (e.g. one allows uppercase, the other does not), the invariant becomes silently violated.

---

## Decision

### 1. Rename `dimensionId` → `ownerAccountId` across all affected modules

The canonical field name for "the ID of the account (personal or organization) that owns this aggregate" is `ownerAccountId`.

Affected entities and files:

| Module | Entity / Record | Field rename |
|--------|-----------------|--------------|
| `workspace.module` | `WorkspaceEntity` | `dimensionId` → `ownerAccountId` |
| `settlement.module` | `SettlementRecord` | `dimensionId` → `ownerAccountId` |
| `workforce.module` | `ScheduleAssignment.accountId` | `accountId` → `ownerAccountId` (align with convention) |

### 2. Add `ownerAccountId` to the business glossary

Add the following entry to `docs/architecture/glossary/business-terms.md`:

> **Owner Account ID** (`ownerAccountId`): The stable, platform-assigned identifier of the Account (personal or organization) that provisioned and owns a given aggregate root. This is the Account's `accountId` as stored in `account.module`. It is the canonical cross-module foreign key for expressing ownership. Use `ownerAccountId` for all domain entities that express ownership by an account. Do not use `dimensionId`, `accountId` (ambiguous with identity UID), or `ownerId`.

### 3. Formally document the `AccountHandle` ↔ `NamespaceSlug` sync mechanism

Add a note to `docs/architecture/notes/model-driven-hexagonal-architecture.md` §6 (Context Mapping) and to the glossary:

- `AccountHandle` and `NamespaceSlug` are **semantically isomorphic**: they share the same character-set constraint and always represent the same string value.
- The synchronization contract is **event-driven**: when an Account is created (`AccountCreated` event), the `namespace.module` creates a `Namespace` with `slug === account.handle`. When an Account's handle changes, a `AccountHandleChanged` event triggers a `Namespace.slug` update.
- Both Zod schemas must be reviewed on any change to either type's regex constraint to preserve isomorphism.

### 4. Add a shared regex constant for handle/slug validation

To prevent schema divergence, extract the shared validation regex into a shared constant:

```typescript
// src/shared/constants/account-handle-pattern.ts
/** Shared regex for AccountHandle and NamespaceSlug — must be kept in sync. */
export const ACCOUNT_HANDLE_PATTERN = /^[a-z0-9][a-z0-9_-]{1,38}[a-z0-9]$/;
```

Both `AccountHandle` (in `account.module`) and `NamespaceSlug` (in `namespace.module`) should import and use this constant in their respective Zod schemas:

```typescript
// account.module/domain.account/_value-objects.ts
import { ACCOUNT_HANDLE_PATTERN } from "@/shared/constants/account-handle-pattern";
export const AccountHandleSchema = z.string().regex(ACCOUNT_HANDLE_PATTERN, "...");

// namespace.module/domain.namespace/_value-objects.ts
import { ACCOUNT_HANDLE_PATTERN } from "@/shared/constants/account-handle-pattern";
export const NamespaceSlugSchema = z.string().regex(ACCOUNT_HANDLE_PATTERN, "...");
```

> **Module boundary note**: The shared constant lives in `src/shared/constants/` (a pure string constant with no domain logic), which is acceptable for a cross-cutting shared kernel. Neither module imports from the other's domain layer.

---

## Consequences

**Positive**:
- `ownerAccountId` is self-documenting and matches the Ubiquitous Language.
- Removes confusion between `dimensionId` (unclear), `accountId` (ambiguous with Firebase UID), and `ownerId`.
- The shared regex constant prevents `AccountHandle` ↔ `NamespaceSlug` schema divergence at the source.
- Context Mapping for `workspace.module → account.module` is made explicit (Customer/Supplier pattern).

**Negative / Trade-offs**:
- **Breaking change**: `dimensionId` field rename affects Firestore document schemas in `workspaces`, `settlements`, and `scheduleAssignments` collections. A Firestore migration script (field rename via Admin SDK batch update) is required before or alongside code deployment.
- All TypeScript code referencing `dimensionId` or `ScheduleAssignment.accountId` must be updated.
- The shared constant introduces a `src/shared/constants/` dependency in both `account.module` and `namespace.module`. This is a **Shared Kernel** pattern and must be maintained jointly.

**Context Mapping impact**:
- `workspace.module → account.module`: **Customer / Supplier** — workspace.module depends on account.module's `AccountId` to populate `ownerAccountId`.
- `namespace.module ↔ account.module`: **Partnership** — both modules co-own the handle/slug invariant via the shared regex constant.

---

## Alternatives Considered

1. **Keep `dimensionId`**: Rejected. Non-UL terminology with no glossary definition causes permanent model rot and onboarding friction.
2. **Use `accountId` as the rename target**: Rejected. `accountId` is ambiguous with Firebase Authentication UID (`identityId`). `ownerAccountId` is unambiguous.
3. **Import `AccountHandleSchema` from `account.module` directly into `namespace.module`**: Rejected. Would violate module boundary isolation — modules may not import from each other's domain layers.
4. **Type-level isomorphism (`NamespaceSlug = AccountHandle`)**: Considered for a future ADR. Requires careful evaluation of downstream type consumers. Deferred to avoid premature coupling.

---

## References

- MDHA §2.2 Ubiquitous Language: `docs/architecture/notes/model-driven-hexagonal-architecture.md`
- MDHA §2.3 Context Mapping — Customer/Supplier and Partnership patterns
- MDHA §2.5 Invariants — Account.handle ↔ Namespace.slug sync is a system invariant
- MDHA §6 Context Mapping in Xuanwu
- Glossary: `docs/architecture/glossary/business-terms.md`
- Source issues: `docs/management/semantics-issues.md` (SEM-003, SEM-005) — translated to this ADR and removed
