# `src/shared/ports/`

## Purpose

Defines **Anti-Corruption Layer (ACL) port interfaces** for cross-cutting infrastructure concerns that are shared across multiple Domain Modules. Following the Dependency Inversion Principle, Application-layer code depends on these stable interfaces rather than on concrete adapters.

> **Cross-cutting vs module-specific ports:**  
> - **This directory (`src/shared/ports/`)** — interfaces for infrastructure services used by *many* modules (caching, queuing, vector search, workflow orchestration, locale, logging, analytics, auth). No single module owns them.  
> - **Module-specific ports (`src/modules/{module}/domain.*/_ports.ts`)** — interfaces for repositories and services owned by a single Bounded Context (e.g., `IWorkspaceRepository`). They live next to the domain types they abstract.

```
Application / Use-Case layer
  └─ depends on → ICachePort, IQueuePort, IVectorIndexPort, IWorkflowPort,
                  IStoragePort, ILocalePort, ILoggerPort, IAnalyticsPort, IAuthPort
                          ↑ (port interface, lives here)
                          |
Infrastructure / Directive layer
  └─ implements → redis.ts, qstash.ts, vector.ts, workflow.ts,
                  localStorage, useLocale directive, ConsoleLogger, Firebase Analytics,
                  Firebase Auth adapter
```

## Exports

### Infrastructure ports (server-side adapters)

| Interface | Concrete adapter | Description |
|-----------|-----------------|-------------|
| `ICachePort` | `src/infrastructure/upstash/redis.ts` | Key-value cache with TTL (get / set / del / delPattern) |
| `IQueuePort` | `src/infrastructure/upstash/qstash.ts` | Async message queue (publish with delay + retries) |
| `IVectorIndexPort<T>` | `src/infrastructure/upstash/vector.ts` | Semantic vector index (upsert / query / delete) |
| `IWorkflowPort` | `src/infrastructure/upstash/workflow.ts` | Durable workflow orchestration (trigger / cancel) |

### Presentation/browser ports (client-side directives)

| Interface | Concrete adapter | Description |
|-----------|-----------------|-------------|
| `IStoragePort` | `window.localStorage` / `window.sessionStorage` | Synchronous key-value browser storage |
| `ILocalePort` | `useLocale` directive (`src/shared/directives`) | Locale persistence + `html[lang]` sync |

### Cross-cutting ports (universal)

| Interface | Concrete adapter | Description |
|-----------|-----------------|-------------|
| `ILoggerPort` | `ConsoleLoggerAdapter` / Cloud Logging | Structured logging (debug / info / warn / error) |
| `IAnalyticsPort` | Firebase Analytics / Mixpanel adapter | Event tracking (track / identify / page) |
| `IAuthPort` | `src/infrastructure/firebase/admin/auth` | Auth state + ID token (getCurrentUserId / getIdToken / signOut / isAuthenticated) |

## Usage

### `ICachePort` — in a use-case (Application layer)

```typescript
import type { ICachePort } from "@/shared/ports";

export async function getWorkspaceById(
  id: string,
  cache: ICachePort,            // ← inject the port, not the adapter
  repo: IWorkspaceRepository,
): Promise<WorkspaceDTO> {
  const cached = await cache.get<WorkspaceDTO>(`workspace:${id}`);
  if (cached) return cached;
  const dto = await repo.findById(id);
  await cache.set(`workspace:${id}`, dto, 300); // 5-min TTL
  return dto;
}
```

### `ILocalePort` — via `useLocale` directive (Presentation layer)

```typescript
// Client Component
import { useLocale } from "@/shared/directives";

export function LanguageToggle() {
  const [locale, setLocale] = useLocale();
  return (
    <button onClick={() => setLocale(locale === "zh-TW" ? "en" : "zh-TW")}>
      {locale}
    </button>
  );
}
```

### `ILoggerPort` — in a use-case or server action

```typescript
import type { ILoggerPort } from "@/shared/ports";

export async function processDocument(
  id: string,
  logger: ILoggerPort,
): Promise<void> {
  logger.info("Processing document", { documentId: id });
  // ...
}
```

### `IAuthPort` — in a use-case (Application layer)

```typescript
import type { IAuthPort } from "@/shared/ports";

export async function getCurrentUserProfile(auth: IAuthPort) {
  const userId = await auth.getCurrentUserId();
  if (!userId) throw new UnauthorizedError("Not authenticated");
  // ...
}
```

## Conventions

- Port interfaces contain **only method signatures** — no implementation, no state.
- Async method signatures use `Promise<T>` for all I/O operations.
- Port interfaces are prefixed with `I` (e.g., `ICachePort`, `ILocalePort`).
- Do not add module-specific port interfaces here (e.g., `IWorkspaceRepository`) — those belong in the owning module's `domain.*/_ports.ts`.
- Concrete adapters implicitly satisfy port interfaces via TypeScript structural typing; no `implements` keyword is required.
- Client-side implementations that are React hooks (e.g., `useLocale`) live in `src/shared/directives/` and carry the `"use client"` directive.
