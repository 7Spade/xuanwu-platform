# `src/` — Application Source

## Purpose

`src/` is the root of all application code. It is organized into five directories, each mapping to a distinct architectural concern in the Xuanwu **Model-Driven Hexagonal Architecture (MDHA)**.

```
src/
├── app/            ← Next.js App Router — routes, layouts, pages (Presentation)
├── design-system/  ← Reusable UI components, design tokens, layout shells
├── infrastructure/ ← Concrete I/O adapters (Firebase, Upstash, Document AI)
├── modules/        ← Domain Modules — 21 Bounded Contexts (mDDD 4-layer)
└── shared/         ← Zero-dependency cross-cutting foundation (types, utils, ports)
```

## Dependency Direction

```
src/app/
   ↓  calls via module public barrels
src/modules/
   ↓  calls via port interfaces
src/infrastructure/
   ↓  implements port interfaces from
src/shared/         ← foundation (no external deps)
```

`src/design-system/` sits beside `src/app/` at the Presentation layer and is consumed by `src/app/` and module `_components/` — it does **not** depend on modules or infrastructure.

## Directory Roles

| Directory | Layer | Depends on | Purpose |
|-----------|-------|-----------|---------|
| `app/` | Presentation | `modules/`, `design-system/`, `shared/` | Next.js routes, layouts, root metadata |
| `design-system/` | Presentation | `shared/` | UI component library and design tokens |
| `infrastructure/` | Infrastructure | `shared/` | Concrete adapters for Firebase, Upstash, Document AI |
| `modules/` | Domain + Application | `shared/`, `infrastructure/` (via ports) | 21 Bounded Contexts following 4-layer DDD |
| `shared/` | Foundation | — | Types, errors, utilities, ACL port interfaces |

## Coding Conventions

- **Identifiers** in English; domain terms may use Traditional Chinese in *internal code comments* (JSDoc, inline explanations) where precision requires it — never in UI text or error messages.
- **TypeScript 5.x** — prefer explicit types; use `unknown` + narrowing at untrusted boundaries; avoid `any`.
- **No circular dependencies** — dependency direction is enforced by layer and validated in CI.
- **Server-side by default** — mark files `"use client"` only when browser APIs or interactivity require it.
- **i18n** — never hardcode UI strings; add keys to `src/shared/i18n/index.ts` in both `en` and `zh-TW`.
- **Secrets** — use environment variables; never commit credentials to source.

## See Also

- Architecture SSOT: [`docs/architecture/notes/model-driven-hexagonal-architecture.md`](../docs/architecture/notes/model-driven-hexagonal-architecture.md)
- Module catalog: [`src/modules/README.md`](./modules/README.md)
- Shared foundation: [`src/shared/README.md`](./shared/README.md)
