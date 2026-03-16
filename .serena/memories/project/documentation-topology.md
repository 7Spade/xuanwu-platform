# Documentation Topology (Governance Baseline)

## Scope and Exclusions

Governance scan scope:
- `.github/`
- `.serena/`
- `docs/management/`
- `docs/architecture/`

Excluded:
- `.agents/skills/`
- `.github/skills/`

## Source of Truth

1. `docs/copilot*` (Copilot/agent workflow semantics)
2. `docs/architecture/notes/model-driven-hexagonal-architecture.md` (architecture semantics and boundaries)

`docs/architecture/README.md` is a navigation index only.

## Current Topology Signals

- Scoped markdown inventory is maintained at `docs/management/documentation-index.md`.
- Governance conflict baseline is maintained at `docs/management/documentation-governance-baseline.md`.
- Management-level docs navigation lives at `docs/management/README.md`.

## Knowledge Pruning Notes

- Project memory content should not keep outdated module cardinality (`16`); current module topology is `22` (17 implemented + 5 scaffold).
- Historical PR-memory files may keep old values as historical context, but project-level reference memories must point to current topology.
