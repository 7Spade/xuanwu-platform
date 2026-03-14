# PR #10 — docs: resolve cross-file documentation inconsistencies, fix slice→module migration, correct VS Code URLs

**Status**: ✅ Merged
**Branch**: `copilot/init-serena-and-index-memory`

## Summary
Comprehensive documentation audit pass. Fixed all tracked issues (#2–#14) in issue.md: inconsistencies between SSOT docs, Copilot instruction files, and actual codebase structure. Also completed the `features/` → `modules/` terminology migration and wired agent-memory MCP to agents.

## Major Changes

### Issues #2–#11 fixed
| Issue | Fix |
|-------|-----|
| ADR index missing ADR-006 and ADR-007 | Added to `docs/architecture/adr/README.md` |
| `workforce.module/` missing from Domain Modules table | Added to `docs/architecture/README.md` |
| Broken i18n paths (`public/localized-files/en.json`) | Replaced with `src/shared/i18n/index.ts` in `copilot-instructions.md` and `xuanwu-ui.agent.md` |
| Stale DDD diagram in README | Updated to `src/modules/<name>.module/` structure |
| Phantom `docs/copilot/` references | Replaced with official VS Code URLs |
| Firebase README missing unimplemented warning | Added `> [!WARNING]` notice |

### Slice → Module terminology migration (Issues #10, #14)
Renamed "feature slice" → "Domain Module" / "module" across 15+ files:
- `xuanwu-application-architecture.instructions.md`
- All DDD prompts (`ddd-infrastructure-adapter`, `ddd-layer-audit`, `ddd-slice-scaffold`)
- `xuanwu-refactor.prompt.md`, `xuanwu-code-review.prompt.md`, `xuanwu-architect.prompt.md`
- `ddd-architecture/SKILL.md`, `x-framework-guardian/SKILL.md`
- `xuanwu-ddd-layers.instructions.md`, `xuanwu-repo-structure.instructions.md`
- `AGENTS.md`, `src/modules/README.md`
- Chinese: "切片" → "模組" in SKILL.md

### Design System: `presentation/` → `tokens/`
- Deleted `src/design-system/presentation/`
- Created `src/design-system/tokens/` (design-token constants)
- Updated all references across docs and code

### VS Code Copilot URL corrections
- `copilot-agents` → `custom-agents` in 3 files (correct VS Code docs path)
- Removed phantom `.serena\memories\*` Windows paths
- Replaced non-existent `docs/` paths with real `docs/architecture/` paths

### Agent MCP alignment
- Added `agent-memory/*` to `xuanwu-research` and `xuanwu-orchestrator` agents
- Added memory workflow documentation distinguishing serena/* (file-backed) vs agent-memory/* (Redis cross-session)
- Added MCP tool assignment guide table to `.github/README.md`

### Serena initialization (this commit session)
- `.serena/project.yml` — project onboarding complete
- `pr-history/` memories for all PRs #1–#9
- PR index memory file

## Files changed (highlights)
- `docs/architecture/README.md` — workforce.module added, design-system tokens tier
- `docs/architecture/adr/README.md` — ADR-006, ADR-007
- `.github/copilot-instructions.md` — i18n path fix, module terminology, agent-memory table
- `src/modules/README.md` — full domain module template with 4-layer structure
- `src/design-system/tokens/` — new directory with index.ts + README.md
- `.vscode/mcp.json` — Serena corrected to `start-mcp-server --context ide --project ${workspaceFolder}`
- `.github/copilot/mcp-coding-agent.json` — same Serena fix for Coding Agent
- All 15+ `.github/prompts/`, `.github/agents/`, `.github/instructions/` files updated
