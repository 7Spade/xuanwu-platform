# ADR-010: SSOT Designation and Account Model Unification

**Date**: 2026-03-17  
**Status**: Accepted  
**Deciders**: Principal Architecture Engineer

---

## Context

The architecture documentation across `docs/architecture/catalog/` and `docs/architecture/glossary/`
had accumulated terminology drift against the design guide. Three specific conflicts were identified:

1. **SSOT ambiguity**: `docs/architecture/README.md` was referenced as the "Domain SSOT" in
   memory indexes, but the actual canonical design document is
   `docs/architecture/notes/model-driven-hexagonal-architecture.md`.

2. **`User` vs `Account` terminology**: The catalog files (`business-entities.md`,
   `event-catalog.md`) and glossary files used `User` as the primary platform account entity.
   The design guide (`model-driven-hexagonal-architecture.md`) establishes `Account` as the
   unified aggregate in `account.module`, with `identity.module` owning auth credentials separately.

3. **`Organization` as a separate entity**: The catalog and glossary treated `Organization` as a
   standalone top-level entity distinct from `User`. The design guide and architecture memory
   (`architecture.md`) already recorded that `org.module` was removed — organizations are
   `Account` records with `accountType = "organization"`.

4. **`profile.module` / `UserProfile` terminology**: Files still referenced `UserProfile` as a
   separate entity, but `profile.module` was removed; the public profile is a sub-aggregate of
   `account.module` under the name `AccountProfile`.

---

## Decision

### 1. SSOT Designation

`docs/architecture/notes/model-driven-hexagonal-architecture.md` is the **canonical Single Source
of Truth (SSOT)** for architecture design philosophy, module list, layer rules, event naming
conventions, and entity terminology.

`docs/architecture/README.md` remains the **documentation index** (navigation hub) but is NOT the
domain model authority. All memory indexes and supporting documents must reference the SSOT
explicitly.

### 2. Account Model Unification

All documentation replaces `User` (as a platform entity) with `Account`:

| Old term | New term | Owned by |
|----------|----------|----------|
| `User` | `Account` | `account.module` |
| `Organization` | `Account (accountType=organization)` | `account.module` |
| `UserProfile` | `AccountProfile` | `account.module` (sub-aggregate) |
| `userId` FK | `accountId` FK | — |
| `orgId` FK | `accountId` FK (where accountType=organization) | — |

**Auth boundary clarification**: Firebase Auth UIDs and credentials remain in `identity.module`.
The `account.module` maps the identity UID → Account aggregate at first login. The two modules
are separate bounded contexts connected via an Anticorruption Layer (ACL).

### 3. Removed Modules

The following modules are formally recorded as removed:

| Module | Disposition |
|--------|------------|
| `org.module` | Absorbed into `account.module` (Team, Membership, org Account) |
| `profile.module` | Absorbed into `account.module` (AccountProfile sub-aggregate) |
| `feature.module` | Removed (PR #12); feature flags via Firebase Remote Config if needed |

### 4. Event Naming

The canonical domain event naming convention is confirmed as `{domain}.{entity}.{verb}` with
dot separators (e.g. `saas.account.created`, `wbs.task.state_changed`). The `saas.org.created`
event is renamed to `saas.account.created` with an updated payload reflecting `accountId` and
`accountType`.

---

## Consequences

### Positive
- All documentation uses consistent terminology aligned with the design guide.
- The SSOT is unambiguously identified — any conflict defers to the SSOT.
- `Account` model correctly represents the unified personal/organization concept.
- `identity.module` / `account.module` separation is clearly documented.

### Negative / Trade-offs
- Existing code may still use `User`/`Organization` entity names and `userId`/`orgId` field names
  until a code-level migration is performed. **This ADR only updates documentation** — a
  separate code migration task is required to align runtime entity names.
- The `saas.org.created` event rename to `saas.account.created` requires a consumer migration
  window per the event contract versioning rules in §8.6 of the SSOT.

---

## Alternatives Considered

1. **Keep `User` + `Organization` as separate documented entities**: Rejected — conflicts with
   the design guide which unified them under `account.module` and removed `org.module`.

2. **Treat `docs/architecture/README.md` as SSOT**: Rejected — it is an index/navigation document,
   not a design authority. The MDDD guide is the authoritative reference.

3. **Defer documentation alignment until code migration**: Rejected — documentation drift compounds
   onboarding cost and causes future agents / engineers to make incorrect assumptions.

---

## References

- [Model-Driven Hexagonal Architecture (SSOT)](../notes/model-driven-hexagonal-architecture.md)
- [Architecture Memory](../../../.serena/memories/project/architecture.md) — module list and removed modules
- [Business Entities](../catalog/business-entities.md) — updated Account entity
- [Event Catalog](../catalog/event-catalog.md) — updated `saas.account.created` event
- [Service Boundary](../catalog/service-boundary.md) — updated diagram and layer ownership
