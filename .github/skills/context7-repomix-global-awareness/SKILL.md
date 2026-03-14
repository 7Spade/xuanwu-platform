---
name: context7-repomix-global-awareness
description: >
  Two-pillar global awareness workflow combining Repomix (codebase snapshot) and
  Context7 (version-accurate framework docs) to give agents comprehensive project context.
  Use when starting a session with cross-module or architectural scope, before any
  framework API usage, or when performing broad impact analysis.
  Triggers: "global awareness", "全域感知", "context initialization", "session bootstrap",
  "codebase snapshot", "framework docs", "repomix pack", "context7 lookup",
  "強化感知", "全局上下文".
---

# Global Awareness Initialization（全域感知初始化）

This skill provides a systematic workflow for giving agents comprehensive context about
**both the codebase** (via Repomix) and **the framework ecosystem** (via Context7) before
undertaking complex tasks. It extends the standard Serena session startup and is the
recommended approach for any session involving cross-module, architectural, or
framework-version-sensitive work.

## When to Use

| Scenario | Trigger |
|----------|---------|
| Session start with cross-module scope | Any task touching 2+ modules |
| Framework API usage (Next.js, React, Firebase…) | Any call to a version-sensitive API |
| Broad impact analysis | PRs, refactors, dependency upgrades |
| Onboarding a new agent to current project state | First session or after long gap |
| Architecture compliance audit | Before or after DDD migration steps |

---

## Two Pillars of Global Awareness

| Pillar | Tool | What It Provides |
|--------|------|-----------------|
| **Codebase Awareness** | `repomix/*` | Full project structure, module boundaries, existing code patterns |
| **Framework Awareness** | `context7/*` | Current API docs for Next.js 15, React 19, Firebase, Tailwind v4, TypeScript 5.x, shadcn/ui |

These two pillars complement **Serena** (precise symbol-level code intelligence) rather than
replace it. Use Serena for targeted edits; use Repomix + Context7 for broad situational
awareness.

---

## Full Workflow

### Phase 0 — Serena Session Startup (prerequisite)

All agents must complete the standard startup sequence first:

```
1. serena-check_onboarding_performed
2. serena-list_memories
3. serena-read_memory(project/architecture)
4. serena-read_memory(project/conventions)
```

### Phase 1 — Codebase Snapshot (Repomix)

Pack the relevant sections of the codebase. Use **Tree-sitter compression** (`compress: true`)
to reduce token usage by ~70% while keeping semantic meaning.

```
repomix-pack_codebase(
  directory: ".",
  compress: true,
  includePatterns: "<target scope — see table below>",
  ignorePatterns: "node_modules/**,dist/**,.next/**,.serena/**"
)
```

**Project-specific scope patterns for this codebase:**

| Task Scope | `includePatterns` |
|-----------|-------------------|
| All modules (overview) | `src/modules/**,docs/architecture/**` |
| Single module deep-dive | `src/modules/<name>.module/**` |
| Domain layer only | `src/modules/*/domain.*/**` |
| Infrastructure & adapters | `src/modules/*/infra.*/**,src/infrastructure/**` |
| Design system | `src/design-system/**,src/shared/**` |
| Architecture docs | `docs/architecture/**,src/modules/*/README.md` |
| Copilot customization | `.github/**` |

After packing, use `repomix-grep_repomix_output` to search the packed output without
re-packing:

```
repomix-grep_repomix_output(
  outputId: <id from pack step>,
  pattern: "domain\\.|_ports\\.ts|IRepository",
  contextLines: 2
)
```

> **When NOT to use Repomix:** For locating a single known symbol or making a surgical edit,
> prefer `serena-find_symbol` / `serena-replace_symbol_body`. Repomix shines for broad
> structural understanding, not precision edits.

### Phase 2 — Framework Documentation (Context7)

Always resolve the library ID first, then query docs. Limit to **3 total calls** per question
(1 resolve + up to 2 queries). This is a best-practice token-budget guideline — not a hard
API rate limit — to keep context size manageable. Refine the query or split into sub-questions
if 2 queries are insufficient.

```
// Step 2a: Resolve library ID
context7-resolve-library-id(
  libraryName: "next.js",
  query: "App Router async params Server Components Next.js 15"
)

// Step 2b: Query with the resolved ID
context7-query-docs(
  libraryId: "/vercel/next.js",
  query: "async params searchParams Server Components App Router"
)
```

**Pre-resolved library IDs for this project:**

| Library | Library ID | Common Query Topics |
|---------|-----------|---------------------|
| Next.js 15 | `/vercel/next.js` | App Router, Server Components, async `params`/`searchParams`, Route Handlers, `loading.tsx`, `error.tsx` |
| React 19 | `/facebook/react` | Server Actions, `useActionState`, Suspense, `use()` hook, concurrent features |
| TypeScript 5.x | `/microsoft/typescript` | `satisfies`, `const` type params, decorators, type predicates |
| Tailwind CSS v4 | `/tailwindlabs/tailwindcss` | v4 config migration, CSS variables, `@theme`, dark mode |
| Firebase JS SDK | `/firebase/firebase-js-sdk` | Firestore v9 modular queries, Auth, Security Rules |
| shadcn/ui | `/shadcn-ui/ui` | Component API, new-york style, theming, `cn()` utility |

> **When NOT to use Context7:** For project-internal conventions and established patterns,
> rely on `serena-read_memory` and the architecture SSOT instead.

### Phase 3 — Synthesize and Annotate

After gathering both pillars:

1. **Cross-reference existing code vs. current API**: Does the codebase use deprecated
   patterns from older framework versions?
2. **Identify framework-version conflicts**: Are there `async params` patterns required by
   Next.js 15 that existing code hasn't adopted?
3. **Build a session context summary** containing:
   - Active module boundaries (from Repomix)
   - Framework constraints that apply to the current task (from Context7)
   - Any breaking changes relevant to the work at hand

---

## Extended Startup Sequence

When the task requires global awareness, extend the Serena startup sequence with phases 1–3:

```
Standard Serena startup (all agents, always):
  1. serena-check_onboarding_performed
  2. serena-list_memories
  3. serena-read_memory(project/architecture)
  4. serena-read_memory(project/conventions)

Extended with global awareness (when scope is cross-module or framework-sensitive):
  5. repomix-pack_codebase (compressed, targeted scope)
  6. context7-resolve-library-id + context7-query-docs (only for version-sensitive APIs)
  7. Synthesize: cross-reference Repomix structure with Context7 API constraints
```

> Steps 5–7 add context but cost tokens. Invoke only when the task scope justifies it.
> Single-file edits with known APIs do not need steps 5–7.

---

## Tool Decision Matrix

| Need | Best Tool | Reason |
|------|-----------|--------|
| Find a specific class or function | `serena-find_symbol` | Precise, indexed lookup |
| Understand module structure broadly | `repomix-pack_codebase` (compress=true) | Full tree snapshot with low token cost |
| Current API signature for a framework | `context7-query-docs` | Version-accurate, avoids stale training data |
| Edit a specific method or class | `serena-replace_symbol_body` | Safe, surgical, language-server-backed |
| Inspect a remote or external repo | `repomix-pack_remote_repository` | Clone-free analysis |
| Cross-file pattern search in local repo | `serena-search_for_pattern` | Indexed, precise |
| Cross-file pattern search in packed output | `repomix-grep_repomix_output` | No re-pack needed |
| Project conventions and architecture facts | `serena-read_memory` | Pre-indexed project memory |

---

## GitHub Copilot Browser Agent Setup

When using GitHub Copilot agents through the **browser interface** (github.com → Copilot →
Coding Agent), both Context7 and Repomix must be registered in the Coding Agent MCP
configuration.

### Verification Checklist

- [ ] Copy `.github/copilot/mcp-coding-agent.json` into
  [Settings → Copilot → Coding agent → MCP configuration](https://github.com/7Spade/xuanwu-platform/settings/copilot/coding_agent)
- [ ] Add required Copilot environment secrets:

  | Secret Name | Purpose |
  |-------------|---------|
  | `COPILOT_MCP_REDIS_URL` | `agent-memory` cross-session recall |
  | `COPILOT_MCP_OPENAI_API_KEY` | `agent-memory` embeddings/generation |
  | `COPILOT_MCP_FIREBASE_SERVICE_ACCOUNT_KEY_PATH` | Firebase inspection |

- [ ] Confirm `.github/workflows/copilot-setup-steps.yml` has the `copilot-setup-steps` job
  that installs `uv` via `astral-sh/setup-uv@v5` (required for `serena`, `markitdown`,
  `agent-memory` MCP servers)
- [ ] After agent runs: verify Context7 resolved a library ID successfully and Repomix
  produced a packed output ID before querying

### Expected Tool Calls in a Global-Aware Session

```
Session start
  └─ serena-check_onboarding_performed ✓
  └─ serena-list_memories ✓
  └─ serena-read_memory(project/architecture) ✓
  └─ serena-read_memory(project/conventions) ✓
  └─ repomix-pack_codebase (compressed, scoped) → outputId
  └─ repomix-grep_repomix_output (search key patterns) → structure summary
  └─ context7-resolve-library-id (for relevant framework) → libraryId
  └─ context7-query-docs (version-sensitive API) → doc excerpts
  └─ [synthesize context] → proceed with task
```

---

## Agents Using This Skill

| Agent | When to invoke |
|-------|---------------|
| `xuanwu-research` | Primary user — all research and context-gathering sessions |
| `xuanwu-architect` | Before system design or impact analysis sessions |
| `xuanwu-orchestrator` | When initializing complex cross-functional delivery |
| `xuanwu-implementer` | Before implementing against version-sensitive framework APIs |
| `xuanwu-quality` | When auditing framework API compliance |

---

## References

- MCP Context7 memory: `.serena/memories/mcp/context7.md`
- MCP Repomix memory: `.serena/memories/mcp/repomix.md`
- MCP Coding Agent config: `.github/copilot/mcp-coding-agent.json`
- VS Code MCP config: `.vscode/mcp.json`
- Serena session startup: `docs/copilot/README.md` (Serena 協同最大化 section)
- Architecture SSOT: `docs/architecture/README.md`
- Agent MCP assignments: `.github/README.md` (MCP tool assignment guide)
