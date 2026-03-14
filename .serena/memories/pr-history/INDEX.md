# Pull Request History Index

## Overview
This index covers all PRs in the xuanwu-platform repository (updated 2026-03-14).

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
| #10 | docs: slice→module migration, phantom paths, VS Code URLs, agent-memory wiring | ✅ Merged | Docs / Architecture |
| #11 | feat: scaffold all 17 MDDD modules + domain-lookup decision framework + overlap analysis | ✅ Merged | Architecture / Domain Modules |
| #12 | docs: maintain documentation consistency after PRs #1–#11 (Occam's Razor pass) | 🔄 Open | Docs / Maintenance |

## Memory File Index

### Project-level memories
- `project/overview` — Purpose, tech stack, key architectural decisions
- `project/commands` — Development, lint, type-check commands; task completion workflow
- `project/architecture` — Domain modules, DDD layers, design system, Firebase structure, App Router layout
- `project/conventions` — Naming conventions, layer rules, MCP tool assignment, agent authoring rules

### MCP server knowledge base
- `mcp/INDEX` — All 13 MCP servers with category, agent assignment, and infrastructure notes
- `mcp/serena` — Code intelligence: symbols, edit, project memory, --context ide
- `mcp/firebase-mcp-server` — Firebase inspection: Firestore, Auth, Security Rules, Hosting
- `mcp/agent-memory` — Redis cross-session semantic recall: semantic vs episodic memory types
- `mcp/context7` — Version-accurate framework docs: Next.js 15, React 19, Tailwind v4
- `mcp/repomix` — Codebase packing: local/remote repo, Tree-sitter compression
- `mcp/playwright` — Browser automation: E2E, screenshots, console errors, hydration check
- `mcp/next-devtools` — Next.js dev server diagnostics: errors, routes, build status
- `mcp/shadcn` — shadcn/ui registry: search, view, install, examples
- `mcp/filesystem` — File I/O: read/write/edit/tree within allowed directories
- `mcp/markitdown` — URL/file → Markdown conversion
- `mcp/sequential-thinking` — Step-by-step structured reasoning with branches and revision
- `mcp/software-planning` — Implementation plan and todo tracking with complexity scores
- `mcp/everything` — MCP protocol testing and environment variable debugging

### PR history memories
- `pr-history/pr-01-parallel-routes` — Next.js @sidebar parallel routes
- `pr-history/pr-02-mcp-config` — MCP schema fix, .vscode/mcp.json creation
- `pr-history/pr-04-app-router-init` — Multi-tenant SaaS directory plan (WIP, not merged)
- `pr-history/pr-05-firebase-config` — Firebase credentials, App Check, RTDB adapter
- `pr-history/pr-06-modular-ddd-design-system` — Modular DDD, design-system, DnD, Firebase restructure
- `pr-history/pr-07-agent-memory-mcp` — agent-memory MCP server integration
- `pr-history/pr-08-agent-memory-verification` — agent-memory compatibility verification (not merged)
- `pr-history/pr-09-docs-conflict-resolution` — Occam's Razor docs cleanup
- `pr-history/pr-10-docs-module-migration` — module terminology, design-system tokens, VS Code URL fixes
- `pr-history/pr-11-scaffold-17-modules` — **PR #11**: scaffold all 17 Domain Modules + domain-lookup decision framework + overlap analysis (full iteration log in `pr-create-modules-for-mddd.md`)

## Architectural Evolution Timeline
1. **PR #1** — App Router structure: parallel routes, named slots
2. **PR #2** — DevTools: MCP config for 12 servers
3. **PR #4** — (WIP) App Router route group planning
4. **PR #5** — Firebase infrastructure: credentials, App Check, RTDB
5. **PR #6** — 🏗 Major: Modular DDD + delete shared-kernel/shared-infra + design-system
6. **PR #7** — DevTools: agent-memory MCP
7. **PR #8** — (Not merged) agent-memory verification
8. **PR #9** — 🧹 Docs: clean up stale paths from PRs #1–#8
9. **PR #10** — 🧹 Docs: features→modules rename, design-system tokens, VS Code URL fixes; Serena initialization
10. **PR #11** — 🏗 Major: scaffold all 17 Domain Modules; domain-lookup decision framework (20 Qs + merge/split rules + 6-step flowchart + overlap analysis)
11. **PR #12** — 🧹 Docs: Occam's Razor maintenance pass after PRs #1–#11; mcp.md firebase env var fix; memory index update
12. **PR #13 (copilot/gradual-value-extraction)** — 🏗 Major: Progressive domain value extraction (Waves 1–8) — all 16 modules receive full domain + application layer extracted from 7Spade/xuanwu; `.serena/memories/modules/` file index created (INDEX.md + 16 per-module files; each lists every .ts file with name, description, and function list)
