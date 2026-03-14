# PR #9 — docs: resolve .github/* documentation conflicts after PRs #1–#8 (Occam's Razor pass)

**Status**: Merged (2026-03-13)
**Branch**: (merged to main)

## Summary
Cleaned up all stale path references, missing files, and format inconsistencies introduced by PRs #1–#8. Focused on minimal surface area (Occam's Razor approach).

## Stale Paths Fixed
`src/shared-kernel/` and `src/shared-infra/` were deleted in PR #6 but remained referenced in:

| File | Stale reference | Fix |
|------|----------------|-----|
| `.github/prompts/ddd-layer-audit.prompt.md` | `src/shared-infra/` (D24 Firebase check); `src/shared-kernel/ports/` (port completeness) | Updated to module-local `src/features/{slice}/domain.*/` paths |
| `.github/prompts/ddd-application-service.prompt.md` | `src/shared-kernel/ports/` | Updated |
| `.github/prompts/ddd-infrastructure-adapter.prompt.md` | `src/shared-kernel/ports/`, `src/shared-kernel/infra-contracts/`, `src/shared-infra/` (×2) | All 4 updated |
| `.github/agents/ddd-infrastructure.agent.md` | `src/shared-infra/` placement rule | Updated |

**Note**: At time of PR #9, paths were updated to use `src/features/{slice}/...` — this was later renamed to `src/modules/` in PR #10.

## Additional Fixes
- `.github/prompts/ddd-slice-scaffold.prompt.md` — removed `.serena\memories\*` Windows-style phantom path reference
- Various `mcp.md` stale entries from PR #7
- Format/wording inconsistencies in agent files

## Key Principle
The Occam's Razor approach: only change exactly what is broken, no refactoring, no terminology changes (those were deferred to PR #10).
