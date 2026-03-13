# Pull Request History Index

## Overview
This index covers all PRs in the xuanwu-platform repository (2026-03-13).

## PR Status Summary

| PR | Title | Status | Key Area |
|----|-------|--------|----------|
| #1 | feat: implement parallel routes across /src/app/ per Next.js canary spec | ✅ Merged | App Router / Next.js |
| #2 | feat: Sync MCP config for Coding Agent + VS Code, add .vscode/mcp.json, wire firebase tools | ✅ Merged | MCP / DevTools |
| #3 | (not found — likely deleted) | ❌ N/A | — |
| #4 | [WIP] Initialize App Router directory structure for multi-tenant SaaS | ❌ Closed (not merged) | App Router / Structure |
| #5 | Hardcode Firebase dev config, reCAPTCHA Enterprise App Check, Realtime Database adapter | ✅ Merged | Firebase / Infrastructure |
| #6 | docs + refactor: integrate Modular DDD, design-system, DnD, Firebase restructure | ✅ Merged | Architecture / DDD |
| #7 | feat: add agent-memory MCP + port PR #8 | ✅ Merged | MCP / agent-memory |
| #8 | feat: add redis/agent-memory-server MCP (verification) | ❌ Closed (not merged — ported into #7) | MCP / agent-memory |
| #9 | docs: resolve .github/* documentation conflicts after PRs #1–#8 | ✅ Merged | Docs / Cleanup |
| #10 | docs: slice→module migration, phantom paths, VS Code URLs, agent-memory wiring | 🔄 Open | Docs / Architecture |

## Memory File Index

### Project-level memories
- `project/overview` — Purpose, tech stack, key architectural decisions
- `project/commands` — Development, lint, type-check commands; task completion workflow
- `project/architecture` — Domain modules, DDD layers, design system, Firebase structure, App Router layout

### PR history memories
- `pr-history/pr-01-parallel-routes` — Next.js @sidebar parallel routes
- `pr-history/pr-02-mcp-config` — MCP schema fix, .vscode/mcp.json creation
- `pr-history/pr-04-app-router-init` — Multi-tenant SaaS directory plan (WIP, not merged)
- `pr-history/pr-05-firebase-config` — Firebase credentials, App Check, RTDB adapter
- `pr-history/pr-06-modular-ddd-design-system` — Modular DDD, design-system, DnD, Firebase restructure
- `pr-history/pr-07-agent-memory-mcp` — agent-memory MCP server integration
- `pr-history/pr-08-agent-memory-verification` — agent-memory compatibility verification (not merged)
- `pr-history/pr-09-docs-conflict-resolution` — Occam's Razor docs cleanup
- `pr-history/pr-10-docs-module-migration` — Current PR (open): module terminology, design-system tokens

## Architectural Evolution Timeline
1. **PR #1** — App Router structure: parallel routes, named slots
2. **PR #2** — DevTools: MCP config for 12 servers
3. **PR #4** — (WIP) App Router route group planning
4. **PR #5** — Firebase infrastructure: credentials, App Check, RTDB
5. **PR #6** — 🏗 Major: Modular DDD + delete shared-kernel/shared-infra + design-system
6. **PR #7** — DevTools: agent-memory MCP
7. **PR #8** — (Not merged) agent-memory verification
8. **PR #9** — 🧹 Docs: clean up stale paths from PRs #1–#8
9. **PR #10** — 🧹 Docs: features→modules rename, design-system tokens, VS Code URL fixes
