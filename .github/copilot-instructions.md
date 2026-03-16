# Copilot Instructions for Xuanwu

Project-wide always-on instructions for GitHub Copilot Chat in this repository.

## Scope

- Apply these rules to all tasks in this repository.
- Use `.github/instructions/*.instructions.md` for language-, framework-, or file-scoped rules.
- Use `.github/README.md` as the repository guide for Copilot customization structure and maintenance.

## Single Sources of Truth

- Architecture philosophy, layer direction, and Ports/Adapters design: `docs/architecture/notes/model-driven-hexagonal-architecture.md`
- Architecture navigation index: `docs/architecture/README.md` (index-only)
- Copilot customization guide: `docs/copilot/README.md`
- Official VS Code Copilot customization docs: https://code.visualstudio.com/docs/copilot/customization

If a task touches business rules or domain terminology, read the SSOT documents before changing code or documentation.

## Always-On Development Rules

### Architecture and boundaries

- Respect layer direction, module boundaries, and public APIs.
- Keep side effects in execution or application layers, not pure contract layers.
- Do not invent domain logic that is not grounded in the SSOT documents.

### Instructions and customization hygiene

- Keep always-on instructions concise; move specialized workflows into prompts, skills, agents, hooks, or scoped instructions according to `.github/README.md`.
- Reuse existing repository documents with links instead of duplicating long policy text.
- Use the official VS Code customization taxonomy from https://code.visualstudio.com/docs/copilot/customization before introducing or renaming customization assets.
- Do not use local folder names or terminology that conflict with official VS Code Copilot concepts.

### i18n

- Do not hardcode UI text in pages or components.
- When UI text changes, update the in-code translation dictionary in:
  - `src/shared/i18n/index.ts` (add keys to both the `en` and `zh-TW` locale entries)

### Files and encoding

- Use UTF-8 without BOM for created or edited text files.
- Keep code identifiers in English by default unless a Taiwan-domain term requires Traditional Chinese for precision.

### Quality and security

- Prefer deterministic, reviewable changes over ad-hoc workarounds.
- Keep documentation synchronized when behavior, setup, or customization layout changes.
- Do not hardcode secrets or bypass existing security boundaries.

## Decision Workflow

1. Read `docs/architecture/notes/model-driven-hexagonal-architecture.md` first when business logic or layer boundaries are involved.
2. Reuse established repository patterns from existing code.
3. **Validate before implement** — verify architecture correctness, module boundaries, and existing tests before writing any new code. Prefer the smallest correct diff.
4. For Copilot customization changes, follow `.github/README.md` first, then the matching spec at https://code.visualstudio.com/docs/copilot/customization, before editing `.github/agents`, `.github/instructions`, `.github/prompts`, or `.github/skills`.
5. For new or ambiguous requests, apply the **Six-Step Intent Pipeline** (`xuanwu-commander` or `.github/skills/xuanwu-intent-pipeline/SKILL.md`) before dispatching work to any specialist agent.

## Official URL Fallback Policy

- If any Copilot behavior, customization schema, or tool capability is unclear, query official documentation URLs first instead of guessing.
- Prefer repository mirrors under `docs/copilot/*`; if a conflict exists, treat the official source URL as final authority and then update repository docs accordingly.

## Custom Agents

All repository-scoped agents live in `.github/agents/`. Use `@xuanwu-commander` as the general entry-point for any request — it applies the six-step intent pipeline and dispatches to the right specialist.

**User-selectable agents:** `xuanwu-commander` · `xuanwu-orchestrator` · `xuanwu-product` · `xuanwu-research` · `xuanwu-architect` · `xuanwu-architecture-chief` · `xuanwu-implementer` · `xuanwu-ui` · `xuanwu-quality` · `xuanwu-docs` · `xuanwu-ops` · `xuanwu-test-expert` · `xuanwu-software-planner` · `xuanwu-sequential-thinking` · `ddd-orchestrator`

**Sub-agent clusters** (`user-invocable: false` — invoked via parent handoffs, not shown in the agent picker):
- **DDD cluster** (`ddd-domain-modeler`, `ddd-application-layer`, `ddd-infrastructure`) — trigger via `@ddd-orchestrator` or `/ddd-slice-scaffold`
- **Architecture cluster** (`xuanwu-architecture-refactor`, `xuanwu-diagram-designer`, `xuanwu-repo-browser`) — trigger via `@xuanwu-architecture-chief` or `/xuanwu-architecture-realign`

See `AGENTS.md` for the full agent catalog and `.github/README.md` for tool assignment rationale.

## Knowledge Persistence

Two complementary memory systems are available. Use them together for best results.

### `store_memory` (VS Code built-in)
When VS Code Copilot Chat built-in memory is available (`github.copilot.chat.copilotMemory.enabled`), use `store_memory` to persist important project conventions, patterns, and preferences so they carry forward across separate conversations.

- Prioritize persisting: naming conventions, architectural decisions, recurring patterns, and facts that are unlikely to be obvious from a limited code sample.

### `agent-memory/*` (Redis-backed cross-session semantic search)
Use `agent-memory/*` for durable, searchable cross-session memory stored in Redis:

| Tool | When to use |
|------|-------------|
| `agent-memory-search_long_term_memory` | Retrieve prior session facts at the start of a task |
| `agent-memory-create_long_term_memories` | Persist architecture decisions, confirmed conventions, and important patterns |
| `agent-memory-memory_prompt` | Enrich a query with prior session context before responding |

**`agent-memory/*` vs `serena/*` memory:**

| Concern | Use |
|---------|-----|
| Project-scoped file notes (saved to `.serena/memories/`) | `serena-write_memory` / `serena-list_memories` |
| Cross-session semantic recall (Redis vector search) | `agent-memory-create_long_term_memories` / `agent-memory-search_long_term_memory` |

The `xuanwu-research` and `xuanwu-orchestrator` agents are the primary users of `agent-memory/*`.

## Firebase MCP Usage

This project is built on Firebase (`xuanwu-i-00708880-4e2d8`). The `firebase-mcp-server` MCP is available for Firebase inspection tasks and is launched through the Firebase CLI MCP entrypoint. Use it to inspect and manage Firebase resources directly from agent tasks rather than writing one-off Admin SDK code.

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

## Upstash MCP Usage

This project has Upstash infrastructure in `src/infrastructure/upstash/`.
The `upstash/*` MCP server provides direct management of Upstash resources without writing code.

### When to use upstash MCP vs SDK

| Scenario | Preferred tool |
|----------|----------------|
| Inspect Redis databases / keys | `upstash/*` MCP |
| Inspect Vector indexes | `upstash/*` MCP |
| Inspect QStash queues / schedules | `upstash/*` MCP |
| Monitor Workflow runs | `upstash/*` MCP |
| Application-layer Redis reads/writes | `redis` from `@/infrastructure/upstash` |
| Semantic vector search in app code | `vectorIndex()` from `@/infrastructure/upstash` |
| Enqueue background jobs in app code | `qstash` from `@/infrastructure/upstash` |
| Durable workflow Route Handlers | `serve` from `@/infrastructure/upstash` |
| Spawn AI coding sandboxes in app code | `createBox` from `@/infrastructure/upstash` |

### Infrastructure SDK import paths

```typescript
import { redis }          from "@/infrastructure/upstash";  // Redis client
import { vectorIndex }    from "@/infrastructure/upstash";  // Vector Index factory
import { qstash }         from "@/infrastructure/upstash";  // QStash publisher
import { serve }          from "@/infrastructure/upstash";  // Workflow Route Handler factory
import { createBox }      from "@/infrastructure/upstash";  // Box sandbox factory
```

All exports are **server-only** (marked with `import "server-only"`).
Do not import from Client Components.

### Coding Agent secrets

Add two Copilot environment secrets to use the Upstash MCP:

| Secret name | Value |
|-------------|-------|
| `COPILOT_MCP_UPSTASH_EMAIL` | Your Upstash account email |
| `COPILOT_MCP_UPSTASH_API_KEY` | Management API key from Upstash console → Account → API Keys |


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

- Copilot customization documentation: `docs/copilot/README.md`
- Repository Copilot customization guide: `.github/README.md`
- Shared multi-agent conventions: `AGENTS.md`
- File-scoped rules: `.github/instructions/*.instructions.md`
- Six-step intent pipeline skill: `.github/skills/xuanwu-intent-pipeline/SKILL.md`

## GitHub Coding Agent Environment Setup

The Coding Agent runs in a fresh Ubuntu environment (GitHub Actions runner) for each session.
Several MCP servers require dependencies that are **not pre-installed** on that runner:

| MCP server | Dependency | How it is installed |
|------------|-----------|---------------------|
| `serena` | `uv` / `uvx` | `.github/workflows/copilot-setup-steps.yml` installs `uv` via `astral-sh/setup-uv@v5` |
| `markitdown` | `uv` / `uvx` | Same — `markitdown-mcp` is a Python tool run via `uvx` |
| `agent-memory` | `uv` / `uvx` | Same — `agent-memory-server` is a Python package launched via `uvx` |

The `.github/workflows/copilot-setup-steps.yml` workflow runs automatically before the Coding Agent starts work.
Do **not** remove or rename the `copilot-setup-steps` job inside that file — Copilot only recognises that exact name.

### Coding Agent MCP configuration

The Coding Agent requires a **different JSON format** from `.vscode/mcp.json`:

| Aspect | VS Code (`.vscode/mcp.json`) | Coding Agent (Settings UI) |
|--------|------------------------------|----------------------------|
| Top-level key | `servers` | `mcpServers` |
| Type value | `"stdio"` | `"stdio"` or `"local"` |
| `tools` field | Not required | **Required** for every server |
| `${workspaceFolder}` | Supported | Use `"."` instead |
| Env var secrets | Any name | Must be prefixed `COPILOT_MCP_` |

Copy the ready-to-paste configuration from `.github/copilot/mcp-coding-agent.json` into
[Settings → Copilot → Coding agent → MCP configuration](https://github.com/7Spade/xuanwu-platform/settings/copilot/coding_agent).

> **firebase-mcp-server note:** This repository now launches firebase-mcp-server through the Firebase CLI entrypoint
> `npx -y firebase-tools@latest mcp`. Do not assume the MCP JSON preconfigures `FIREBASE_PROJECT_ID` or
> `SERVICE_ACCOUNT_KEY_PATH`; use the Firebase CLI environment actually available to the agent session.

> **agent-memory note:** To use agent-memory in the Coding Agent, add two Copilot environment secrets:
> `COPILOT_MCP_REDIS_URL` (Redis Cloud TLS URL, e.g. `rediss://default:PASSWORD@host:port`) and
> `COPILOT_MCP_OPENAI_API_KEY` (OpenAI API key for embeddings/generation).
> For local VS Code use, the server prompts for these values via input dialogs on first start.

## Available MCP Tools

The following MCP servers are configured in `.vscode/mcp.json` (local VS Code chat) and the [GitHub Coding Agent settings](https://github.com/7Spade/xuanwu-platform/settings/copilot/coding_agent) (Coding Agent browser tasks).
Reference them in agent `tools:` lists using `<server-name>/*`.

| Server | Key | Primary Use |
|--------|-----|-------------|
| Agent Memory | `agent-memory/*` | Persistent cross-session memory for agents (Redis-backed semantic search) |
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
| Upstash | `upstash/*` | Upstash platform management: create/inspect Redis databases, Vector indexes, QStash queues, Workflow runs, and Box sandboxes. Requires `COPILOT_MCP_UPSTASH_EMAIL` + `COPILOT_MCP_UPSTASH_API_KEY`. |

Agents must only include tools they genuinely need. See `.github/README.md` for the per-agent tool assignment rationale.
