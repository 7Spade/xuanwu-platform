# Documentation Governance Baseline / 文件治理基準

> Baseline generated from scoped scan of `.github/`, `.serena/`, `docs/management/`, `docs/architecture/`.
> Exclusions enforced during scan: `.agents/skills/`, `.github/skills/`.

## Fact Sources (SoT)

1. `docs/copilot*`
2. `docs/architecture/notes/model-driven-hexagonal-architecture.md`

All governance decisions in this baseline defer to these sources when conflicts occur.

## Scan Outcome Summary

- Scoped markdown files: **151**
- Exact duplicate groups: **0**
- Near-duplicate pairs (scan threshold): **0**

## Conflict Classification Result

### 1) Duplicate Docs
- No exact duplicate markdown content detected in scoped set.

### 2) Near-Duplicate Docs
- No high-similarity near-duplicate pairs detected by automated scan in scoped set.

### 3) Terminology Conflict
- **Resolved in this update**: `.serena` project-memory content still described outdated module counts (`16`) while architecture docs use current module topology (`22 = 17 implemented + 5 scaffold`).

### 4) Architecture Rule Conflict
- **Resolved in this update**: `.serena/memories/project/overview.md` contained wrong 4-layer dependency direction text (`Domain → Application → Infrastructure → Presentation`).
- Aligned to MDHA/DDD rule: `Presentation → Application → Domain ← Infrastructure`.

### 5) Documentation Boundary Conflict
- **Resolved in this update**: Missing management-level navigation/ownership index for governance docs.
- Added `docs/management/README.md` and linked governance artifacts to make responsibilities explicit.

## Governance Rules Applied

- Architecture semantics and boundaries are authoritative only in MDHA (`docs/architecture/notes/model-driven-hexagonal-architecture.md`).
- `docs/architecture/README.md` is a navigation index, not architecture-design authority.
- Copilot/agent workflow semantics come from `docs/copilot*` and `.github/copilot-instructions.md`.
- Historical snapshots remain valid only when labeled as historical context, not current operational truth.

## Regenerated Index Artifacts

- [`documentation-index.md`](./documentation-index.md): complete scoped inventory and semantic classification.
- `.serena` knowledge indexes updated to reflect current documentation topology and governance entrypoints.
