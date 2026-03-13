# features/

Each feature slice lives in its own directory and follows the DDD layering convention:

```
features/
└── <slice-name>/
    ├── index.ts                    # Public API (barrel export)
    ├── domain.<aggregate>/         # Domain layer
    │   ├── _entity.ts              # Aggregate root / entity
    │   ├── _value-objects.ts       # Value objects
    │   └── _service.ts             # Domain service (optional)
    ├── core/                       # Application layer
    │   ├── _use-cases.ts           # Use case orchestration
    │   ├── _actions.ts             # Server Actions (mutations)
    │   └── _queries.ts             # Server queries (reads)
    ├── infra.<adapter>/            # Infrastructure adapters
    │   └── _repository.ts          # Repository implementation
    └── _components/                # Presentation layer (UI)
        └── <FeatureName>.tsx
```

## Rules

- Presentation MUST NOT import from Domain or Infrastructure directly.
- Application MUST NOT import from Presentation or Infrastructure (use ports).
- Domain MUST be pure — no I/O, no framework imports.
- Infrastructure implements ports defined within the feature slice's own domain layer.
- Cross-slice access MUST go through another slice's `index.ts` barrel.

See `docs/architecture/README.md` for the authoritative architecture guide.
