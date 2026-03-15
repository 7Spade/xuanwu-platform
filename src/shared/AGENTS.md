# `src/shared/` — AI Agent & Copilot Usage Rules

This file defines how GitHub Copilot agents and AI coding tools should interact with the `src/shared/` layer.

## Dependency direction

```
src/shared/  ←  (no deps outside shared)
    ↓
src/infrastructure/  (depends on shared for port interfaces and types)
    ↓
src/modules/         (depends on shared + infrastructure via ports)
    ↓
src/app/             (depends on modules + shared)
```

**Key principle:** `src/shared/` is the foundation. Infrastructure adapters implement port interfaces from `src/shared/ports/`; Domain Modules consume those adapters via the same port interfaces. This ensures every layer is independently testable and swappable.

## When to use `src/shared/`

| Task | Use |
|------|-----|
| Reusable pure utility (date, string, array, object) | `utils/` |
| Typed application error | `errors/` |
| Runtime constant (APP_NAME, locale list, format token) | `constants/` |
| Client React hook (`useToggle`, `useDebounce`, `useLocalStorage`) | `directives/` |
| UI translation string | `i18n/` |
| TypeScript structural interface (API contract, Pagination) | `interfaces/` |
| Pure transformation / validation pipeline | `pipes/` |
| Cross-cutting infrastructure port interface | `ports/` |
| Zod schema, value-object primitive, or `Result<T,E>` | `types/` |

## Rules agents MUST follow

1. **Never import from `src/modules/` inside any `src/shared/` file.** Doing so creates an inverted dependency and violates the DDD layer contract.
2. **Never add side effects** (network calls, Firestore reads, `import "server-only"`) to files under `src/shared/` — this layer must remain usable in every context including tests and Storybook.
3. The `directives/` sub-module carries `"use client"` and **must not** be re-exported from `src/shared/index.ts`. Always import hooks directly from `@/shared/directives`.
4. When a new pure utility or type is needed by more than one module, **add it here** rather than duplicating it inside individual modules.
5. When adding a new sub-module, create both an `index.ts` and a `README.md` for it, and re-export from `src/shared/index.ts` (unless it is client-only like `directives`).

## How agents use port interfaces (`ports/`)

Port interfaces in `src/shared/ports/` are the bridge between Application-layer use cases and infrastructure adapters. Agents working on features that require caching, queuing, vector search, or workflows MUST:

1. **Depend on the port interface** in the use case / application service, not on the concrete adapter:
   ```typescript
   // ✅ Correct — depend on port interface
   import type { ICachePort } from "@/shared/ports";

   export function createMyUseCase(cache: ICachePort) { ... }

   // ❌ Wrong — depend on concrete Upstash adapter directly
   import { redis } from "@/infrastructure/upstash";
   ```

2. **Wire the concrete adapter** only at the composition root (Server Action, Route Handler, or Cloud Function entry):
   ```typescript
   // Server Action
   import { redis } from "@/infrastructure/upstash";
   import type { ICachePort } from "@/shared/ports";

   const cacheAdapter: ICachePort = {
     get: (key) => redis.get(key),
     set: (key, value, ttl) => redis.set(key, value, ttl ? { ex: ttl } : undefined),
     del: (key) => redis.del(key),
     delPattern: async (pattern) => {
       const keys = await redis.keys(pattern);
       if (keys.length) await redis.del(...keys);
     },
   };

   const result = await createMyUseCase(cacheAdapter).execute(input);
   ```

3. **Upgrade paths** for each port:

   | Port | In-process default | Production adapter |
   |------|-------------------|--------------------|
   | `ICachePort` | `MemoryCacheStore` (`@/infrastructure/firebase/admin/db/cacheLayer.ts`) | `redis` from `@/infrastructure/upstash` |
   | `IQueuePort` | Direct HTTP POST | `qstash` from `@/infrastructure/upstash` |
   | `IVectorIndexPort` | — | `vectorIndex()` from `@/infrastructure/upstash` |
   | `IWorkflowPort` | — | `workflowClient` from `@/infrastructure/upstash` |

## How agents use shared resources in automation pipelines

When orchestrating multi-step AI agent tasks that interact with this codebase:

- **Reading constants / errors / interfaces:** import from `@/shared` barrel or specific sub-paths. No adapter wiring needed.
- **Caching agent state / embeddings:** wire `ICachePort` → `redis` (Upstash Redis). Use `IVectorIndexPort` → `vectorIndex()` for semantic recall.
- **Background job dispatch:** wire `IQueuePort` → `qstash` (Upstash QStash) to enqueue deferred processing.
- **Durable multi-step workflows:** use `IWorkflowPort` → `workflowClient` (Upstash Workflow) for long-running agent tasks.
- **Structured logging:** use `AppError` from `@/shared/errors` to produce typed, catchable failures.

## Adding i18n keys

When adding UI text for a new feature:

1. Open `src/shared/i18n/index.ts`.
2. Add the key to **both** the `"zh-TW"` and `"en"` locale entries.
3. Keep keys grouped by feature/module prefix (e.g. `workspace.settings.*`, `auth.*`).
4. Do **not** hardcode UI text directly in components; always use the `useTranslation` hook or `getMessages()`.

## Adding errors

1. Add a new class to `src/shared/errors/index.ts` extending `AppError`.
2. Assign a unique `code` string in `UPPER_SNAKE_CASE`.
3. Document the HTTP `statusCode` in the class constructor.
4. Export from the sub-module's `index.ts` — it is already re-exported from `@/shared`.

## Adding port interfaces (`ports/`)

Port interfaces in `src/shared/ports/` represent **cross-cutting infrastructure abstractions** that are not owned by a single Domain Module (e.g., caching, queuing, pub/sub). They follow the same Dependency Inversion Principle as module-level ports but are shared across the entire application.

Rules:
- Port interfaces are plain TypeScript `interface` or `type` — no concrete classes.
- Concrete adapters implementing these ports live in `src/infrastructure/` (e.g., `src/infrastructure/upstash/redis.ts` for `ICachePort`).
- Application code depends on the port interface; never on the concrete adapter directly.

## Serena tool guidance

When working on `src/shared/`:

```
serena-find_symbol("AppError")              # find error class
serena-find_symbol("useToggle")             # find directive
serena-find_referencing_symbols("AppError") # audit all callers
serena-search_for_pattern("from \"@/shared")# find all consumers
serena-find_symbol("ICachePort")            # find port interface
serena-find_referencing_symbols("ICachePort") # audit all port consumers
```

## Quick reference

```
@/shared                          → server-safe exports (constants, errors, interfaces, i18n, pipes, types, utils, ports)
@/shared/directives               → client-only React hooks
@/shared/ports                    → cross-cutting port interfaces (ACL)
@/infrastructure/firebase/admin   → Firebase Admin SDK helpers (Server Actions / Route Handlers)
@/infrastructure/firebase/client  → Firebase Web SDK helpers (Client Components)
@/infrastructure/upstash          → Upstash adapters: redis, vectorIndex, qstash, workflow, box
@/infrastructure/document-ai      → Genkit + Document AI flow (server-only)
```

