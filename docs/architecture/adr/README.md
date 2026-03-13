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
