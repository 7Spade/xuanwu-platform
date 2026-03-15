# `src/shared/ports/`

## Purpose

Defines **Anti-Corruption Layer (ACL) port interfaces** for cross-cutting infrastructure concerns that are shared across multiple Domain Modules. Following the Dependency Inversion Principle, Application-layer code depends on these stable interfaces rather than on concrete adapters.

> **Cross-cutting vs module-specific ports:**  
> - **This directory (`src/shared/ports/`)** — interfaces for infrastructure services used by *many* modules (caching, queuing, vector search, workflow orchestration). No single module owns them.  
> - **Module-specific ports (`src/modules/{module}/domain.*/_ports.ts`)** — interfaces for repositories and services owned by a single Bounded Context (e.g., `IWorkspaceRepository`). They live next to the domain types they abstract.

```
Application / Use-Case layer
  └─ depends on → ICachePort, IQueuePort, IVectorIndexPort, IWorkflowPort
                          ↑ (port interface, lives here)
                          |
Infrastructure layer (src/infrastructure/)
  └─ implements → redis.ts, qstash.ts, vector.ts, workflow.ts
```

## Exports

| Interface | Concrete adapter | Description |
|-----------|-----------------|-------------|
| `ICachePort` | `src/infrastructure/upstash/redis.ts` | Key-value cache with TTL (get / set / del / delPattern) |
| `IQueuePort` | `src/infrastructure/upstash/qstash.ts` | Async message queue (publish with delay + retries) |
| `IVectorIndexPort<T>` | `src/infrastructure/upstash/vector.ts` | Semantic vector index (upsert / query / delete) |
| `IWorkflowPort` | `src/infrastructure/upstash/workflow.ts` | Durable workflow orchestration (trigger / cancel) |

## Usage

### In a use-case (Application layer)

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

### In a component hook (Presentation layer)

```typescript
// Resolve the concrete adapter at the composition root (e.g., inside the hook)
import { redis } from "@/infrastructure/upstash";
import type { ICachePort } from "@/shared/ports";

const cache: ICachePort = redis; // Redis satisfies ICachePort
```

## Conventions

- Port interfaces contain **only method signatures** — no implementation, no state.
- Method signatures use `Promise<T>` for all async operations.
- Port interfaces are prefixed with `I` (e.g., `ICachePort`).
- Do not add module-specific port interfaces here (e.g., `IWorkspaceRepository`) — those belong in the owning module's `domain.*/_ports.ts`.
- Concrete adapters in `src/infrastructure/` implicitly satisfy the port interface via structural typing; no `implements` keyword is required.
