# Architecture Decision Records (ADR) / 架構決策紀錄

This directory stores architecture decisions that affect system boundaries,
domain modeling, runtime behavior, or operational constraints.

---

## ADR Index / ADR 索引

| ID | Title | Status | Date |
|----|-------|--------|------|
| ADR-001 | Adopt DDD 4-layer architecture | Accepted | — |
| ADR-002 | Use Next.js App Router with parallel routing | Accepted | — |
| ADR-003 | Use Tailwind CSS v4 with shadcn/ui | Accepted | — |
| ADR-004 | Use Firebase (Firestore + Auth + Storage) as infrastructure | Accepted | — |
| ADR-005 | Use Event Bus for SaaS ↔ Workspace boundary crossing | Accepted | — |
| ADR-006 | Adopt Modular DDD — each module is self-contained, no shared global domain directory | Accepted | — |
| ADR-007 | Use `@atlaskit/pragmatic-drag-and-drop` for drag-and-drop interactions + Visual Indicators (VIs) | Accepted | — |
| [ADR-008](./20260316-navigation-logic-gaps.md) | Navigation logic gaps — auth guard, post-login redirect, dead-end routes (E2E audit) | Proposed | 2026-03-16 |
| [ADR-009](./20260316-ui-ux-navigation-gaps.md) | UI/UX navigation gaps — unreachable pages, missing back-links, active state (E2E audit) | Proposed | 2026-03-16 |
| [ADR-010](./20260316-status-semantic-disambiguation.md) | Status field semantic disambiguation and lifecycle naming convention | Proposed | 2026-03-16 |
| [ADR-011](./20260316-workspace-grant-expiry-invariant.md) | WorkspaceGrant expiry domain invariant enforcement | Proposed | 2026-03-16 |
| [ADR-012](./20260316-workspace-namespace-isolation.md) | Workspace-Namespace isolation — `dimensionId` rename and `AccountHandle`↔`NamespaceSlug` coupling | Proposed | 2026-03-16 |
| [ADR-013](./20260317-ssot-alignment-account-model.md) | SSOT designation and Account model unification — `User`→`Account`, `Organization`→`Account(org)`, event rename | Accepted | 2026-03-17 |
| [ADR-014](./20260317-scaffold-modules-added.md) | Document 5 scaffold modules (governance, knowledge, subscription, taxonomy, vector-ingestion) + workspace.module 3-aggregate split | Accepted | 2026-03-17 |

When adding new ADRs, update this index with links in chronological order.

---

## Naming Convention / 命名規範

- File pattern: `YYYYMMDD-short-title.md`
- Example: `20260312-event-bus-contract-versioning.md`

---

## Required Sections / 必要章節

Each ADR should include:

1. **Context** — what situation prompted this decision
2. **Decision** — the specific choice made
3. **Consequences** — trade-offs and implications
4. **Alternatives Considered** — what else was evaluated
5. **Status** — `proposed` | `accepted` | `superseded` | `deprecated`
