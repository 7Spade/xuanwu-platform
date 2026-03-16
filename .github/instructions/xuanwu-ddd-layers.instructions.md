---
name: "Xuanwu DDD Layer Rules"
description: "Four-layer DDD enforcement rules: Presentation → Application → Domain → Infrastructure. Applied to all src/ TypeScript/JavaScript files."
applyTo: "src/**/*.{ts,tsx,js,jsx}"
---

# Xuanwu DDD Layer Rules

This project follows a strict 4-layer DDD architecture inside each Domain Module.
All code in `src/` MUST respect the layer dependency direction defined below.

## Layer Diagram

```
┌──────────────────────────────┐
│ Presentation Layer           │  src/**/_components/, src/app/
│ (UI / API / Controller)      │
└──────────────▲───────────────┘
               │ depends on
┌──────────────┴───────────────┐
│ Application Layer            │  src/**/core/_use-cases.ts
│ (Use Cases / ApplicationSvc) │  src/**/_actions.ts, _queries.ts
└──────────────▲───────────────┘
               │ depends on
┌──────────────┴───────────────┐
│ Domain Layer                 │  src/**/domain.*/
│ (Entities / ValueObjects /   │  (value objects, ports, and events
│  Domain Services / Rules)    │   live inside the owning module)
└──────────────▲───────────────┘
               │ depends on
┌──────────────┴───────────────┐
│ Infrastructure Layer         │  src/modules/<module>/infra.*/
│ (DB / API / Queue / Storage) │  (Firebase adapters, repo impls)
└──────────────────────────────┘
```

## Dependency Rules (MUST enforce)

### Presentation Layer
- MUST NOT import from Domain or Infrastructure directly.
- MUST call Application Layer (use cases, actions, queries) only.
- MUST NOT contain business logic or validation rules.
- React components use `'use client'` only when browser APIs or interactivity require it.

### Application Layer (Use Cases / Application Services)
- MUST NOT import from Presentation or Infrastructure directly.
- MUST call Domain objects (entities, value objects, domain services) for business logic.
- MUST call Infrastructure via **port interfaces** defined within the same Domain Module's domain layer.
- MUST NOT contain business rule logic — delegate to Domain layer.
- Orchestrates: load aggregate → apply domain logic → persist via port → emit event.

### Domain Layer (Entities / Value Objects / Domain Services / Rules)
- MUST be pure: no I/O, no side effects, no framework imports.
- MUST NOT import from Application, Presentation, or Infrastructure.
- Entity invariants MUST be enforced inside the entity, not in application services.
- Value Objects MUST be immutable and self-validating.
- Domain Services handle logic that doesn't belong to a single entity.

### Infrastructure Layer (Repositories / Adapters / Queue / Storage)
- MUST implement port interfaces defined within the owning Domain Module's domain layer.
- MUST NOT contain business logic.
- MUST NOT be imported by Application or Domain layers directly (use ports).
- Adapter implementations live in `src/modules/<module>/infra.<adapter>/`.

## Forbidden Imports (violates layer direction)

```typescript
// ❌ Application layer calling Infrastructure directly (bypass port)
import { FirestoreAdapter } from '@/modules/namespace.module/infra.firestore/_repository'

// ❌ Domain layer importing Application logic
import { createTaskUseCase } from '@/modules/workspace.module/core/_use-cases'

// ❌ Presentation calling Domain directly (must go through Application)
import { TaskEntity } from '@/modules/workspace.module/domain.tasks/_entity'

// ✅ Correct: Presentation → Application
import { createTask } from '@/modules/workspace.module'

// ✅ Correct: Application → Domain (entity/VO)
import { TaskEntity } from './_entity'

// ✅ Correct: Application → Port interface defined in the same module
import type { ITaskRepository } from './domain.tasks/_ports'
```

## File Placement Rules per Layer

| Layer | Allowed paths in a module |
|-------|---------------------------|
| Presentation | `_components/`, `index.ts` public API re-exports |
| Application | `core/_use-cases.ts`, `core/_actions.ts`, `_actions.ts`, `_queries.ts`, `core/_dto.ts` |
| Domain | `domain.*/_entity.ts`, `domain.*/_value-objects.ts`, `domain.*/_service.ts`, `domain.*/_events.ts`, `domain.*/_ports.ts` |
| Infrastructure | `infra.{adapter}/_repository.ts`, `infra.{adapter}/_mapper.ts` |

## Cross-Layer Communication Pattern

```
UI Action
  └─> Server Action / Route Handler  [Application]
        └─> Use Case
              ├─> Load Aggregate via IRepository port  [Domain]
              ├─> Apply business rule on Aggregate      [Domain]
              ├─> Persist via IRepository.save()        [Infrastructure]
              └─> Emit DomainEvent via IEventBus port   [Infrastructure]
```

## References
- Model-Driven Hexagonal Architecture guide: `docs/architecture/model-driven-hexagonal-architecture.md`
- Architecture SSOT: `docs/architecture/README.md`
- Business entities: `docs/architecture/catalog/business-entities.md`
- Event catalog: `docs/architecture/catalog/event-catalog.md`
- ADR index: `docs/architecture/adr/README.md`
