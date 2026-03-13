# workforce.module

**Bounded Context:** Workforce Scheduling  
**Layer:** Bridge (SaaS ↔ Workspace)

## Purpose

`workforce.module` is the Bridge context between the SaaS layer and the Workspace layer.
It handles workforce capacity planning, scheduling, and allocation of accounts to workspace work.

## What this module owns

| Concern | Description |
|---------|-------------|
| WorkforceSchedule | Capacity plan for an org account's members |
| WorkAllocation | Assignment of an account to workspace work items |
| CapacityConstraint | Limits on how much work can be assigned per period |

## Cross-module dependencies

| Module | Direction | Reason |
|--------|-----------|--------|
| `account.module` | → | Members being scheduled are Accounts |
| `workspace.module` | → | Work is scoped to a workspace |
| `work.module` | → | Allocations reference Work Items |

## Standard 4-layer structure

```
workforce.module/
├── index.ts
├── domain.workforce/
│   ├── _entity.ts
│   ├── _value-objects.ts
│   ├── _ports.ts
│   └── _events.ts
├── core/
├── infra.firestore/
└── _components/
```
