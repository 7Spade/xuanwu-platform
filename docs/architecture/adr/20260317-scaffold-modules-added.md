# ADR-011: Document Scaffold Modules and workspace.module Domain Aggregate Split

**Status**: Accepted  
**Date**: 2026-03-17

---

## Context

During a comprehensive architecture scan, five module directories were discovered in
`src/modules/` that had no corresponding documentation in the architecture catalog,
ADR log, or Serena memory files:

- `governance.module`
- `knowledge.module`
- `subscription.module`
- `taxonomy.module`
- `vector-ingestion.module`

These modules exist as scaffolds only — they have module directory structure but no
entity files (`_entity.ts`), use-cases, or infrastructure implementations yet.

The same scan also confirmed that `workspace.module` does **not** contain a single
monolithic aggregate. It owns three separate domain aggregates, each with its own
subdirectory:

- `domain.workspace` — `WorkspaceEntity` (scope, grants, WBS tasks, locations)
- `domain.issues` — `IssueEntity` (issue tracking within a workspace)
- `domain.daily` — `DailyLogEntity` (daily work logs per workspace)

This contradicted the previous documentation, which described `workspace.module` as
a single aggregate boundary.

Additionally, `WorkspaceGrant` in `domain.workspace/_entity.ts` uses `userId` at the
code level, which is inconsistent with the platform-wide `Account` terminology
established in ADR-010. Renaming this field requires a dedicated migration PR and
must not be done as a side-effect of documentation work.

---

## Decision

1. **Document the five scaffold modules** in:
   - `docs/architecture/catalog/business-entities.md` (Scaffold Modules section)
   - `docs/architecture/README.md` (Domain Modules table, marked as scaffold)
   - `docs/architecture/catalog/index.md`
   - `.serena/memories/modules/INDEX.md`
   - Individual Serena memory files under `.serena/memories/modules/`

2. **Update `workspace.module` documentation** to reflect its three domain aggregates
   (`domain.workspace`, `domain.issues`, `domain.daily`) wherever it is referenced.

3. **Note the `userId` code-level inconsistency** in `WorkspaceGrant` without
   modifying any `.ts` source files. A follow-up PR must rename the field to
   `accountId` with a Firestore migration.

4. The scaffold modules are assigned to their anticipated architecture layers:
   - `governance.module` → SaaS
   - `knowledge.module` → Workspace
   - `subscription.module` → SaaS
   - `taxonomy.module` → SaaS (cross-cutting)
   - `vector-ingestion.module` → SaaS (cross-cutting)

---

## Consequences

- **Positive**: Architecture catalog now accurately reflects 22 modules (17 implemented
  + 5 scaffold) and the true aggregate structure of `workspace.module`.
- **Positive**: Future implementors can discover scaffold modules via architecture
  documentation before they encounter empty directories in code.
- **Neutral**: The `userId` inconsistency in `WorkspaceGrant` is now formally tracked.
  It will be resolved in a follow-up migration PR.
- **Risk**: Scaffold module layer assignments are based on design intent; they may be
  revised when implementation begins.

---

## Alternatives Considered

- **Do not document scaffold modules until implemented** — rejected because undocumented
  scaffolds create confusion for contributors discovering empty module directories.
- **Delete scaffold directories** — rejected because the scaffolds represent planned
  bounded contexts that have been intentionally staked out.

---

## Related ADRs

- [ADR-010](./20260317-ssot-alignment-account-model.md) — `User` → `Account` rename,
  which established the terminology inconsistency now noted in `WorkspaceGrant`.
