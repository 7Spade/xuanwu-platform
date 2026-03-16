---
name: ddd-infrastructure-adapter
description: 'Design or implement Infrastructure Layer adapters: Firestore Repository, Event Bus, Outbox writer, Storage adapter — fulfilling port interfaces for a Xuanwu bounded context.'
agent: 'ddd-infrastructure'
argument-hint: 'Context and adapter type, e.g.: workspace.module FirestoreTaskRepository | skill-xp.module XpOutboxWriter'
---

# DDD Infrastructure Adapter Workflow

This prompt drives Step 3 of the DDD cycle: implement port interfaces with concrete adapters.

## Task Types

1. **Repository Adapter** — Firestore implementation of IRepository for an aggregate.
2. **Outbox Writer** — Transactional event publishing via the outbox pattern [S1].
3. **Storage Adapter** — Firebase Storage upload/download operations.
4. **Queue Adapter** — Cloud Tasks or background job integration.
5. **D24 Remediation** — Move Firebase SDK calls from domain modules into proper adapters.

## Workflow

1. Identify the port interface to implement from the slice's `domain.*/_ports.ts`.
2. Check infra contracts needed in the slice's domain layer.
3. Write the adapter class implementing the port interface.
4. Use Transactional Outbox [S1] for all `save()` operations.
5. Add Version Guard [S2] for optimistic locking.
6. Write adapter tests using Firestore emulator or jest mocks.

## Guardrails

- Adapter class MUST implement a port interface — no standalone concrete class.
- MUST use transactional outbox pattern [S1] for aggregate saves.
- NO business logic inside adapters — only data mapping and I/O.
- Firebase SDK calls MUST stay inside `src/modules/{module}/infra.*`.
- Domain module `domain.*` and `core/` folders must never import from `firebase`.

## Output Contract

- Adapter class in `src/modules/{module}/infra.{adapter}/` (named after the concrete technology, e.g. `infra.firestore/`).
- Port interface in `src/modules/{module}/domain.*/_ports.ts` (if new).
- Adapter tests using Firestore emulator or mocks.

Bounded context / module: ${input:context:e.g. workspace.module}
Adapter type and name: ${input:adapter:e.g. FirestoreTaskRepository}
