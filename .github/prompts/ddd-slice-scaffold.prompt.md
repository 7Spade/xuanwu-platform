---
name: ddd-slice-scaffold
description: 'Scaffold a complete DDD-structured domain module with all four layers: Domain (entities/VOs/ports), Application (use cases/actions/DTOs), Infrastructure (repository/mapper), and Presentation (components/index).'
agent: 'ddd-orchestrator'
argument-hint: 'Slice name and main aggregate, e.g.: reporting.module ReportEntity | billing.module InvoiceEntity'
---

# DDD Slice Scaffold Workflow

This prompt drives the full DDD cycle for a new bounded context from scratch.

## What is scaffolded

```
src/modules/{module-name}.module/
├── index.ts                         ← Public API (Presentation exports only)
│
├── domain.{context}/                ← Step 1: Domain Layer
│   ├── _entity.ts                   ← Aggregate Root + Entities
│   ├── _value-objects.ts            ← Value Objects (immutable, self-validating)
│   ├── _service.ts                  ← Domain Service (if needed)
│   ├── _events.ts                   ← Domain Event definitions
│   └── _ports.ts                    ← Outbound Port interfaces (IRepository, IEventBus)
│
├── core/                            ← Step 2: Application Layer
│   ├── _use-cases.ts                ← Use Case orchestration
│   ├── _actions.ts                  ← Server Actions (thin adapter → use case)
│   ├── _queries.ts                  ← Read queries (CQRS read side)
│   └── _dto.ts                      ← Data Transfer Objects
│
├── infra.{adapter}/                 ← Step 3: Infrastructure Layer (one folder per adapter)
│   ├── _repository.ts               ← Repository implementation (Firestore, etc.)
│   └── _mapper.ts                   ← Domain ↔ Persistence mapper
│
└── _components/                     ← Step 4: Presentation Layer
    ├── {SliceName}View.tsx           ← Main container component
    └── {SubComponent}.tsx
```

## Workflow

1. Read domain glossary from `docs/architecture/catalog/business-entities.md` and `docs/architecture/glossary/business-terms.md`.
2. **Domain Layer** (ddd-domain-modeler): Entity + VOs + Events.
3. **Application Layer** (ddd-application-layer): Use cases + Server Actions + Queries.
4. **Infrastructure Layer** (ddd-infrastructure): Repository adapter + persistence mapper.
5. **Presentation Layer** (xuanwu-ui): Components calling server actions.
6. **Public API**: Wire `index.ts` to expose only Presentation exports.
7. **Register**: Add slice to `src/modules/README.md`.

## Guardrails

- Domain objects MUST NOT have framework/SDK imports.
- Application layer MUST call only port interfaces.
- Infrastructure MUST implement port interfaces.
- `index.ts` MUST export only Presentation-safe APIs.
- Follow naming from `docs/architecture/README.md` and Serena project memories.

## Output Contract

- Complete file tree matching the scaffold above.
- Each file with correct imports and layer boundary enforcement.
- Unit tests for all domain invariants.
- Integration tests for application use cases with mocked ports.
- Updated `src/modules/README.md` slice table.

Module name: ${input:moduleName:e.g. reporting.module}
Main aggregate: ${input:aggregate:e.g. ReportEntity}
Primary use cases: ${input:usecases:e.g. CreateReport, ApproveReport, ArchiveReport}
