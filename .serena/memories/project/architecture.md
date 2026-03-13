# Xuanwu Platform — Architecture Reference

## Domain Modules (`src/modules/`)
Each module = one Bounded Context, named `<name>.module/`:
```
src/modules/<name>.module/
├── domain/              ← Domain Layer (pure, no I/O; entities, value-objects, services, repositories[interface], types)
├── application/         ← Application Layer (use-cases, dto, commands, queries)
├── infrastructure/      ← Infrastructure Layer (repositories[impl], mappers, persistence)
├── presentation/        ← Presentation Layer (components, hooks, store)
├── constants/
├── utils/
└── index.ts             ← ONLY public API surface
```

Known modules (as of PR #10):
- `org.module/` — Organisation management
- `workspace.module/` — Workspace management
- `ai.module/` — AI/Genkit integration
- `workforce.module/` — Workforce scheduling (planned)

## DDD Layer Rules
- **Domain**: pure, no I/O, no framework imports
- **Application**: orchestrates domain via port interfaces; no direct DB/UI
- **Infrastructure**: implements Domain repository interfaces; no business rules
- **Presentation**: React components, hooks, store; no direct DB access

## Design System (`src/design-system/`)
```
design-system/
├── primitives/   ← shadcn/ui components
├── components/   ← wrappers/enhanced primitives
├── patterns/     ← composite UI patterns
└── tokens/       ← design constants (color, spacing, typography)
```

## Firebase Infrastructure (`src/infrastructure/firebase/`)
- `client/` — Web SDK (browser)
- `functions/` — Admin SDK (server-side)

## Shared Utilities (`src/shared/`)
- `i18n/index.ts` — in-code translation dictionary (en + zh-TW)
- `interfaces/` — API contracts (ApiResponse, PaginationQuery, FirestoreDocument, VisDateMetadata)

## App Router Structure (`src/app/`)
- `(marketing)/` — public marketing pages
- `(auth)/` — login, register, forgot-password
- `(invite)/` — invite token pages
- `(shared)/` — shareId pages
- `(admin)/` — admin panel
- `(main)/` — authenticated app (parallel routes with @sidebar)
  - `(account)/` — profile, security, notifications, organizations
  - `[slug]/` — organization context
  - `[slug]/[workspaceId]/(workspace)/` — workspace context with WBS
  - `[slug]/[workspaceId]/(standalone)/editor/` — standalone editor
