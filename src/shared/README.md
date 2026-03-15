# `src/shared/` — Shared Layer

## Purpose

`src/shared/` is a **zero-dependency cross-cutting layer** that provides utilities, types, constants, and error classes that are used by every Domain Module in the project. It has **no knowledge of any Domain Module** and must never import from `src/modules/`.

```
src/
├── app/            ← Next.js App Router (Presentation)
├── infrastructure/ ← Concrete adapters (Firebase, Upstash, Document AI)
├── modules/        ← Domain Modules (mDDD Bounded Contexts)
└── shared/         ← ← ← YOU ARE HERE
    ├── constants/  ← Global runtime constants (APP_NAME, locales, format tokens)
    ├── directives/ ← Client-side React hooks ("use client"; useToggle, useDebounce…)
    ├── errors/     ← Typed application errors (AppError hierarchy)
    ├── i18n/       ← Translation dictionary and locale resolution helpers
    ├── interfaces/ ← Structural type contracts (ApiResponse, PaginatedResult, FirestoreDocument…)
    ├── pipes/      ← Pure transformation functions (schemaPipe, trimPipe, composePipes…)
    ├── ports/      ← Anti-corruption-layer (ACL) port interfaces for cross-cutting concerns
    ├── types/      ← Zod-backed value-object schemas and the Result<T,E> monad
    └── utils/      ← Pure helper functions (formatDate, capitalise, chunk…)
```

## Import rules

| From | Allowed imports |
|------|----------------|
| `src/shared/*` | Only other `src/shared/*` sub-modules (no circular deps) |
| `src/modules/*` | `@/shared` barrel or specific sub-paths |
| `src/infrastructure/*` | `@/shared` barrel or specific sub-paths |
| `src/app/*` | `@/shared` barrel or specific sub-paths |

### Recommended import path

For server-compatible code (Server Components, Server Actions, Route Handlers):

```typescript
import { AppError, formatDate, PaginatedResponse } from "@/shared";
```

For client-only React hooks (Client Components only):

```typescript
import { useToggle, useDebounce } from "@/shared/directives";
```

For anti-corruption-layer port interfaces:

```typescript
import type { ICachePort, IQueuePort } from "@/shared/ports";
```

## Sub-module responsibilities

| Sub-module | Responsibility | Server-safe? |
|------------|---------------|:---:|
| `constants` | Compile-time and runtime global constants | ✅ |
| `directives` | Client-side React hooks (`"use client"`) | ❌ (client only) |
| `errors` | Typed error hierarchy (`AppError`, `NotFoundError`, …) | ✅ |
| `i18n` | Translation dictionary + locale resolution | ✅ |
| `interfaces` | Structural TypeScript interfaces (API, Pagination, Firestore) | ✅ |
| `pipes` | Pure transformation / validation pipelines | ✅ |
| `ports` | Anti-corruption-layer port interfaces for infrastructure | ✅ |
| `types` | Zod schemas + `Result<T,E>` monad | ✅ |
| `utils` | Pure utility functions (date, string, array, object) | ✅ |

## Stability contract

- All exports from `@/shared` (and its sub-paths) are considered **stable public API**.
- Any breaking change to a shared export requires updating all callers in `src/modules/` and `src/infrastructure/`.
- Avoid adding application-specific logic here; shared code must remain generic and reusable.

## Adding new code

1. Choose the correct sub-module based on the table above.
2. Add your export to the sub-module's `index.ts`.
3. If you create a new sub-module, add a `README.md` and re-export from `src/shared/index.ts`.
4. Verify there are no circular dependencies: `shared/*` → `shared/*` is allowed; `shared/*` → `modules/*` is forbidden.
5. Run `npm run typecheck` to confirm no type errors are introduced.
