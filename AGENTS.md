# Shared Multi-Agent Conventions

Conventions shared across all GitHub Copilot agents in this repository.

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

## References

- Customization guide: `.github/README.md`
- Architecture SSOT: `docs/architecture/README.md`
- Always-on rules: `.github/copilot-instructions.md`
