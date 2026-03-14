---
name: "Xuanwu Customization Authoring Rules"
description: "Project-specific authoring rules for Copilot customization assets under .github, including prompts, agents, skills, and instruction files."
applyTo: ".github/**/*.{md,json,yml,yaml}"
---

# Xuanwu Customization Authoring Rules

## Source of Truth

- MUST follow the official VS Code Copilot customization documentation (https://code.visualstudio.com/docs/copilot/customization) for custom instructions, agents, prompt files, agent skills, and hooks before editing repository customizations.
- MUST treat `.github/README.md` as the canonical repository maintenance guide for customization structure and consolidation decisions.
- MUST keep local customization names aligned with the project-specific `xuanwu-*` naming strategy when consolidating overlapping assets.

## Instructions Files

- MUST include valid YAML frontmatter with at least `name`, `description`, and `applyTo`.
- MUST scope `applyTo` no broader than needed for the behavior being enforced.
- MUST write imperative, testable rules and explain non-obvious constraints briefly.

## Prompt Files

- MUST use only supported frontmatter fields for prompt files.
- MUST give each prompt a discoverable `name` and `description`.
- MUST keep prompt files workflow-oriented; move stable policy into instructions instead of duplicating it.
- MUST keep `README.md` synchronized with the actual prompt command set whenever prompts are added, renamed, merged, or removed.
- SHOULD remind the agent to follow the Serena session lifecycle when the prompt can begin substantive repository work directly.

## Agent Files

- MUST use least-privilege tools.
- MUST express handoffs as `label`/`agent` objects.
- MUST include `serena/*` for repository-scoped agents that can initiate research, planning, implementation, review, documentation, diagnostics, or operations work on this workspace.
- SHOULD consolidate overlapping personas into project-specific functional `xuanwu-*.agent.md` files instead of reintroducing fragmented specialist agents.

## Skill Files

- MUST keep each skill in its own folder with a `SKILL.md` entry file.
- SHOULD keep `SKILL.md` focused and move long procedures into `references/` when needed.
- MUST keep direct file links accurate after any consolidation.

## Safety

- MUST NOT embed secrets, tokens, or personal credentials.
- MUST require deterministic, reviewable customization content.
- MUST preserve workspace hooks that enforce the Serena session lifecycle unless replacing them with an equivalent deterministic mechanism.
- MUST run `npm run check` after editing instruction files when the repository baseline allows it.
