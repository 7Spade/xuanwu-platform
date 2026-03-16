# Xuanwu Platform — Code Style and Conventions

## TypeScript
- Target: TypeScript 5.x with ES2022 semantics
- Strict mode enabled
- Prefer `unknown` + narrowing over `any`
- No `any` at public API boundaries

## Naming Conventions
- Classes, React components, types: `PascalCase`
- Variables, functions, methods: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- File names: `kebab-case` (e.g., `use-translation.ts`)
- React component files: may use `PascalCase.tsx`
- Module directories: `<name>.module/` (e.g., `org.module/`)
- **Domain event `type` strings**: canonical format per `docs/architecture/notes/model-driven-hexagonal-architecture.md` and `docs/architecture/catalog/event-catalog.md` is `{domain}.{entity}.{verb}` (e.g. `wbs.task.state_changed`). Note: current code uses colon-separated format (`workspace:task:state:changed`) — alignment with the canonical convention is a known pending cleanup tracked in `docs/architecture/adr/` (create an ADR when resolving).

## File Structure Rules
- Each Domain Module exposes ONLY `index.ts` as public API — never import internal files directly from outside
- Server-side data fetching: module `queries.ts`
- Server mutations: module `actions.ts`
- Firebase SDK calls ONLY inside `src/modules/<module>/infra.*` or `src/infrastructure/firebase/`
- React components: `'use client'` ONLY when browser APIs or interactivity required; default to Server Components

## Comments
- Only add comments for intent, constraints, trade-offs, or non-obvious behavior
- Remove stale/commented-out code during refactors
- Do NOT add obvious "what" comments

## i18n
- NEVER hardcode UI text in pages or components
- Add all UI text to `src/shared/i18n/index.ts` in BOTH `en` and `zh-TW` locales
- Use `useTranslation` hook from `@/shared/i18n`

## Imports
- Use `@/` path alias for src-relative imports
- Import from module public API only (never internal module paths)
- Sort: external > @/ > relative

## Error Handling
- Always handle async errors with structured error propagation
- No silent failures
- Validate unknown input with type guards or schema validation at boundaries

## Security
- Never commit secrets (API keys, tokens, passwords)
- Use environment variables for sensitive config
- Reject invalid input early at boundaries
