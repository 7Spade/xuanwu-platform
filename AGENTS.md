# Shared Multi-Agent Conventions

> Tags: `agents` `conventions` `handoff` `architecture-constraints` `safety`

Conventions shared across all GitHub Copilot agents in this repository.  
For the full intent pipeline, MCP tool matrix, and slash command catalog → [`docs/copilot/README.md`](docs/copilot/README.md).

## Tool Selection

- Prefer **Serena** symbol tools over `grep`/`glob`/`codebase` for TypeScript navigation.
- Prefer **Context7** for version-sensitive framework APIs (Next.js 15, React 19, Tailwind v4).
- Prefer **firebase-mcp-server** for Firestore/Auth inspection over one-off Admin SDK code.
- Use **Repomix** when an agent needs a full repository snapshot for context.

## Architecture Constraints

- Respect the 4-layer DDD dependency direction: Presentation → Application → Domain ← Infrastructure.
- Port interfaces live in the owning module's `domain.*/_ports.ts`, not in a shared kernel.
- Infrastructure adapters live in `src/modules/{module}/infra.{adapter}/`.
- Firebase SDK calls must stay inside `src/modules/{module}/infra.*` or `src/infrastructure/firebase/`.

## Handoff Protocol

- Agents hand off to specialized agents rather than attempting work outside their scope.
- Always pass the current task context in the handoff `prompt` field.
- Return to the calling agent (or `xuanwu-orchestrator`) after completing a sub-task.

## Safety

- Do not commit secrets, tokens, or credentials.
- Do not bypass existing Firebase Security Rules.
- Prefer deterministic, reviewable changes over ad-hoc workarounds.

## Agent Catalog

### User-Selectable Entry-Point Agents

| Agent | Primary Use |
|-------|-------------|
| `xuanwu-commander` | Six-step intent pipeline dispatcher — use for any ambiguous or complex request |
| `xuanwu-orchestrator` | Delivery coordinator routing work across all specialist agents |
| `xuanwu-product` | Requirements, acceptance criteria, GitHub issues |
| `xuanwu-research` | Codebase discovery, framework docs (Context7), knowledge-graph sync |
| `xuanwu-architect` | System design, API contracts, module and boundary audits |
| `xuanwu-architecture-chief` | Architecture documentation refinement (delegates to architecture sub-cluster) |
| `xuanwu-implementer` | Next.js, React, TypeScript, server/client boundary implementation |
| `xuanwu-ui` | Mobile-first UI, shadcn/ui, Tailwind CSS, i18n-safe components |
| `xuanwu-quality` | Lint/build/test, security checks, Firebase rule scrutiny |
| `xuanwu-docs` | README, architecture docs, schema docs, diagrams |
| `xuanwu-librarian` | Markdown library curation: hierarchical/graphical/category/tag refactoring, stale-content cleanup, and broken-index repair with full-information preservation |
| `xuanwu-ops` | CI/CD, deployment workflows, runtime infrastructure |
| `xuanwu-test-expert` | Next.js preflight diagnostics and runtime verification |
| `xuanwu-software-planner` | Implementation planning and todo tracking |
| `xuanwu-sequential-thinking` | Step-by-step debugging and complex reasoning |
| `ddd-orchestrator` | DDD migration coordinator (delegates to DDD sub-cluster) |

### Sub-Agent Clusters

Sub-agents have `user-invocable: false` — they do **not** appear in the VS Code agent picker but are invoked automatically via parent-agent handoffs. In the GitHub Copilot Coding Agent, all sub-agents are available through the `task` tool regardless of `user-invocable`.

**DDD Cluster** — invoke via `@ddd-orchestrator` or `/ddd-slice-scaffold`:

| Sub-Agent | Layer |
|-----------|-------|
| `ddd-domain-modeler` | Domain Layer: aggregates, entities, value objects, invariants |
| `ddd-application-layer` | Application Layer: use cases, actions, queries, port orchestration |
| `ddd-infrastructure` | Infrastructure Layer: Firebase adapters, repositories, event buses |

**Architecture Cluster** — invoke via `@xuanwu-architecture-chief` or `/xuanwu-architecture-realign`:

| Sub-Agent | Role |
|-----------|------|
| `xuanwu-architecture-refactor` | Architecture documentation structure refactoring |
| `xuanwu-diagram-designer` | Mermaid diagram refinement and standardization |
| `xuanwu-repo-browser` | Read-only architecture analysis and structure extraction |

## References

- Customization guide: `.github/README.md`
- **Architecture SSOT**: `docs/architecture/notes/model-driven-hexagonal-architecture.md` ← canonical source for all DDD/layer rules
- Architecture navigation hub: `docs/architecture/README.md`
- Always-on rules: `.github/copilot-instructions.md`
- Full agent catalog with intent pipeline & MCP matrix: `docs/copilot/README.md`
