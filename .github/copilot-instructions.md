# Copilot Instructions for Xuanwu

Project-wide always-on instructions for GitHub Copilot Chat in this repository.

## Scope

- Apply these rules to all tasks in this repository.
- Use `.github/instructions/*.instructions.md` for language-, framework-, or file-scoped rules.
- Use `.github/README.md` as the repository guide for Copilot customization structure and maintenance.

## Single Sources of Truth

- Business logic: `docs/architecture/README.md`
- Codebase reference baseline: `docs/architecture/README.md` and established code patterns

If a task touches business rules or domain terminology, read the SSOT documents before changing code or documentation.

## Always-On Development Rules

### Architecture and boundaries

- Respect layer direction, slice boundaries, and public APIs.
- Keep side effects in execution or application layers, not pure contract layers.
- Do not invent domain logic that is not grounded in the SSOT documents.

### Instructions and customization hygiene

- Keep always-on instructions concise; move specialized workflows into prompts, skills, agents, hooks, or scoped instructions according to `.github/README.md`.
- Reuse existing repository documents with links instead of duplicating long policy text.
- Use the official VS Code customization taxonomy from `docs/copilot/customization/overview.md` before introducing or renaming customization assets.
- Do not use local folder names or terminology that conflict with official VS Code Copilot concepts.

### i18n

- Do not hardcode UI text in pages or components.
- When UI text changes, update both locale files with identical keys:
  - `public/localized-files/en.json`
  - `public/localized-files/zh-TW.json`

### Files and encoding

- Use UTF-8 without BOM for created or edited text files.
- Keep code identifiers in English by default unless a Taiwan-domain term requires Traditional Chinese for precision.

### Quality and security

- Prefer deterministic, reviewable changes over ad-hoc workarounds.
- Keep documentation synchronized when behavior, setup, or customization layout changes.
- Do not hardcode secrets or bypass existing security boundaries.

## Decision Workflow

1. Read `docs/architecture/README.md` when business logic is involved.
2. Reuse established repository patterns from existing code.
3. **Validate before implement** — verify architecture correctness, slice boundaries, and existing tests before writing any new code. Prefer the smallest correct diff.
4. For Copilot customization changes, follow `.github/README.md` first, then the matching spec under `docs/copilot/customization/`, before editing `.github/agents`, `.github/instructions`, `.github/prompts`, or `.github/skills`.

## Knowledge Persistence

When VS Code Copilot Chat built-in memory is available (`github.copilot.chat.copilotMemory.enabled`), use `store_memory` to persist important project conventions, patterns, and preferences so they carry forward across separate conversations.

- Prioritize persisting: naming conventions, architectural decisions, recurring patterns, and facts that are unlikely to be obvious from a limited code sample.

## Firebase MCP Usage

This project is built on Firebase (`xuanwu-i-00708880-4e2d8`). The `firebase-mcp-server` MCP is pre-configured with the project ID. Use it to inspect and manage Firebase resources directly from agent tasks rather than writing one-off Admin SDK code.

### When to use firebase-mcp-server

| Scenario | Preferred tool |
|----------|----------------|
| Inspect Firestore collections/documents | `firebase-mcp-server/*` |
| Check or validate Security Rules | `firebase-mcp-server/*` |
| List Auth users or check custom claims | `firebase-mcp-server/*` |
| Query Storage bucket paths | `firebase-mcp-server/*` |
| Trigger or inspect Firebase Hosting deploys | `firebase-mcp-server/*` |
| Server-side mutations in production code | Admin SDK in Server Actions |
| Real-time subscriptions in the browser | Web SDK in Client Components |

### Tool selection priority for Firebase work

```
firebase-mcp-server/* (inspect/admin) > Admin SDK (server mutations) > Web SDK (client real-time)
```

- For **data inspection**: use `firebase-mcp-server/*` — no code change needed.
- For **server-side writes**: use the Admin SDK in Server Actions or Route Handlers.
- For **client real-time**: use the Web SDK in Client Components.

## Serena MCP Usage

If Serena MCP is configured in `.vscode/mcp.json`, it is the preferred code-intelligence tool. Agents must prefer Serena over raw file search whenever working with TypeScript symbols, references, or project memory.

Prefer these tools over `grep`, `codebase`, or `search` when exploring TypeScript code:

| Tool | When to use |
|------|-------------|
| `serena-get_symbols_overview` | First call when opening an unfamiliar file — get top-level symbol map. |
| `serena-find_symbol` | Locate a class, function, type, or variable by name across the codebase. |
| `serena-find_referencing_symbols` | Trace where a symbol is used before renaming or deleting it. |
| `serena-search_for_pattern` | Regex-based search across the project when symbol lookup is insufficient. |
| `serena-find_file` | Locate a file by name pattern when the path is unknown. |
| `serena-list_dir` | Explore directory contents; prefer over filesystem `ls` for project files. |

### Code editing (write)

Use symbol-level tools before falling back to line-based edits:

| Tool | When to use |
|------|-------------|
| `serena-replace_symbol_body` | Replace the full implementation of a known symbol. |
| `serena-insert_after_symbol` | Add a new function, method, or class after an existing symbol. |
| `serena-insert_before_symbol` | Add imports, types, or declarations before an existing symbol. |
| `serena-replace_content` | Replace a literal or regex-matched string within a file. |
| `serena-rename_symbol` | Rename a symbol safely across the entire codebase via the language server. |

### Tool selection priority

```
Serena symbol tools > grep/glob > filesystem > raw codebase search
```

- For **symbol lookup**: use `serena-find_symbol` before `grep`.
- For **file navigation**: use `serena-list_dir` / `serena-find_file` before `filesystem-list_directory`.
- For **code edits**: use `serena-replace_symbol_body` or `serena-insert_*` before line-based edits.

## Companion Files

- Repository Copilot customization guide: `.github/README.md`
- Shared multi-agent conventions: `AGENTS.md`
- File-scoped rules: `.github/instructions/*.instructions.md`

## Available MCP Tools

The following MCP servers are configured in `.vscode/mcp.json` (local VS Code chat) and the [GitHub Coding Agent settings](https://github.com/7Spade/xuanwu-platform/settings/copilot/coding_agent) (Coding Agent browser tasks).
Reference them in agent `tools:` lists using `<server-name>/*`.

| Server | Key | Primary Use |
|--------|-----|-------------|
| Firebase | `firebase-mcp-server/*` | Firebase project management, Firestore, Auth, and App Hosting |
| Everything | `everything/*` | General-purpose MCP protocol testing and utilities |
| Filesystem | `filesystem/*` | Local file read/write operations |
| Sequential Thinking | `sequential-thinking/*` | Multi-step structured reasoning for debugging, algorithm design, and complex analysis tasks that benefit from explicit thought steps |
| Software Planning | `software-planning/*` | Implementation plan and todo tracking |
| Context7 | `context7/*` | Version-accurate framework and library documentation |
| Markitdown | `markitdown/*` | Convert URLs and files to Markdown for AI consumption |
| Playwright | `playwright/*` | Browser automation and end-to-end testing |
| Next.js DevTools | `next-devtools/*` | Next.js dev-server diagnostics and runtime inspection |
| shadcn/ui | `shadcn/*` | shadcn/ui component registry and add commands |
| Repomix | `repomix/*` | Pack repository or remote repos into AI-readable format |
| Serena | `serena/*` | Primary code-intelligence tool: symbol search/edit/rename, reference tracing, pattern search, and per-project memory. Prefer over raw file search. See **Serena MCP Usage** section above. |

Agents must only include tools they genuinely need. See `.github/README.md` for the per-agent tool assignment rationale.
