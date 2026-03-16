# `.github/` — Copilot Customization Agent Rules

This file applies to work under `.github/` only. Use it as folder-scoped guidance for Copilot customization assets, workflows, and maintenance documents.

## Scope

- This directory contains repository-scoped Copilot customization assets: agents, prompts, instructions, hooks, MCP configuration, and customization maintenance docs.
- Treat this file as a `.github/`-local supplement to the workspace-level [AGENTS.md](../AGENTS.md) and the always-on [.github/copilot-instructions.md](./copilot-instructions.md).
- Keep this file concise. Put long procedures in the canonical docs instead of duplicating them here.

## Single Sources of Truth

- Architecture philosophy and boundary rules: [docs/architecture/notes/model-driven-hexagonal-architecture.md](../docs/architecture/notes/model-driven-hexagonal-architecture.md)
- Architecture baseline and domain terminology: [docs/architecture/README.md](../docs/architecture/README.md)
- Copilot customization system overview: [docs/copilot/README.md](../docs/copilot/README.md)
- Repository customization structure and consolidation rules: [.github/README.md](./README.md)
- Always-on repository rules: [.github/copilot-instructions.md](./copilot-instructions.md)

If these sources conflict, follow the architecture SSOT first for business and boundary decisions, then follow the customization docs for packaging and tool-boundary decisions.

## What `.github/` Changes Must Preserve

1. Xuanwu is model-driven first: Domain Model → Use Case → Ports → Infrastructure → UI. Customizations must reinforce this order, not invert it.
2. Hexagonal and DDD boundaries stay explicit. Do not author agents, prompts, or instructions that normalize domain logic in UI, Server Actions, repositories, or infrastructure adapters.
3. Each customization type has one responsibility. Follow the official VS Code taxonomy before adding or moving files:
   - always-on rules → `.github/copilot-instructions.md` or workspace/root `AGENTS.md`
   - file-scoped rules → `.github/instructions/*.instructions.md`
   - reusable slash workflows → `.github/prompts/*.prompt.md`
   - specialized personas with tools and handoffs → `.github/agents/*.agent.md`
   - portable capabilities → `.github/skills/<skill>/SKILL.md`
   - lifecycle automation → `.github/hooks/*.json`
4. Repository customizations must stay aligned with official VS Code Copilot terminology. Do not introduce local naming that conflicts with “agents”, “skills”, “hooks”, or “agent plugins”.

## Agent System Rules

1. Default repository entry point is `xuanwu-commander`. New top-level workflows should assume the six-step intent pipeline, not bypass it.
2. Repository-scoped agents that initiate substantive repo work must expose `serena/*` and prefer Serena over raw search for code intelligence.
3. Tool lists must follow least privilege. Add only the MCP servers and built-in tools the agent genuinely needs.
4. Sub-agents must remain `user-invocable: false` unless there is a deliberate decision to promote them to direct user entry points.
5. Handoffs must use explicit `label` and `agent` objects, and should reflect real Xuanwu workflow transitions rather than generic persona chaining.
6. Keep the canonical Xuanwu suite aligned with [docs/copilot/README.md](../docs/copilot/README.md) and [.github/README.md](./README.md). Do not create overlapping personas when an existing `xuanwu-*` agent already owns the responsibility.

## Serena and Context Rules

1. When authoring agents or prompts that begin substantive repository work, remind them to follow the Serena startup sequence documented in [docs/copilot/README.md](../docs/copilot/README.md): onboarding check, memory list, architecture memory, conventions memory.
2. For cross-module or version-sensitive work, prefer the documented Context7 + Repomix global-awareness flow instead of ad-hoc context stuffing.
3. Use `agent-memory/*` only where cross-session semantic recall is warranted. Do not add it broadly to every agent.

## Editing Rules for `.github/` Assets

1. Prefer links to canonical docs over copying long policy blocks into prompts, agents, or skills.
2. Keep always-on files lean. Move file-specific or workflow-specific guidance into scoped instructions, prompts, skills, or agent bodies.
3. Keep stable names aligned with the `xuanwu-*` naming strategy and current agent catalog.
4. Do not reference files, prompts, agents, hooks, or skills that do not exist.
5. Do not embed secrets, tokens, or personal credentials in examples, hooks, agent bodies, or MCP configuration.
6. Keep Markdown readable and operational: short sections, direct rules, and only the minimum examples needed to clarify a non-obvious constraint.

## Sync Requirements

When a `.github/` change alters behavior, structure, naming, or discoverability, update the relevant companion docs in the same change set:

- [.github/README.md](./README.md) for repository layout, ownership, and consolidation rules
- [docs/copilot/README.md](../docs/copilot/README.md) for agent-system overview, six-step pipeline, Serena workflow, or MCP matrix changes
- [.github/copilot-instructions.md](./copilot-instructions.md) only when the rule is truly always-on and repository-wide

## Review Checklist

- Does the change strengthen, or at least preserve, MDDD + Hexagonal boundaries?
- Is the chosen customization type the official and minimal one for the job?
- Are agent tool lists least-privilege and Serena-aware?
- Are links, names, and catalogs synchronized with the current repository state?
- Is long policy text linked instead of duplicated?

Domain Model\
↓\
Use Case\
↓\
Ports\
↓\
Infrastructure\
↓\
UI

Never reverse this order.
