# namespace.module

**Bounded Context:** Namespace / 命名空間  
**Layer:** SaaS

## Purpose

`namespace.module` is the shared path-resolution service for the platform.
A namespace binds workspaces under an Account's handle — either a personal account handle
or an organization account handle.

Namespace is independent of both `account.module` and `workspace.module` because it
must be reachable from both personal and organization contexts without coupling them.

## What this module owns

| Concern | Description |
|---------|-------------|
| Namespace entity | Slug-to-Account binding with global uniqueness |
| Slug reservation | Reserve/release a namespace slug |
| Workspace binding | Register workspaces under a namespace path |
| Path resolution | Resolve `handle/workspace-slug` → WorkspaceId |

## Key aggregate

`Namespace` — owned by one Account (AccountType: personal | organization); globally unique slug.

## Cross-module dependencies

| Module | Direction | Reason |
|--------|-----------|--------|
| `account.module` | → | Namespace owner is an Account |
| `workspace.module` | ← | Workspaces register under a namespace on creation |

## Standard 4-layer structure

```
namespace.module/
├── index.ts
├── domain.namespace/
│   ├── _entity.ts               # Namespace aggregate root
│   ├── _value-objects.ts        # NamespaceId, NamespaceSlug, WorkspacePathRef
│   ├── _ports.ts                # INamespaceRepository, ISlugAvailabilityPort
│   └── _events.ts               # NamespaceRegistered, WorkspaceRegisteredUnderNamespace
├── core/
│   ├── _use-cases.ts
│   ├── _actions.ts
│   └── _queries.ts
├── infra.firestore/
└── _components/
```
