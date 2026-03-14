# workforce.module

**Bounded Context:** Workforce Scheduling  
**Layer:** Bridge (SaaS ↔ Workspace)

## Purpose

`workforce.module` is the Bridge context between the SaaS layer and the Workspace layer.
It answers the question: **"Who is doing the work, when, and at what capacity?"**

It handles workforce capacity planning, scheduling, and allocation of accounts to workspace work items.

> **Boundary vs `workspace.module`:**  
> `workforce.module` = "Who does what, and when?" (scheduling, capacity, person-to-work allocation)  
> `workspace.module` = "What is the workspace and what work is planned?" (project scope, structure, WBS, issues)  
>  
> Assigning a person to a task / planning capacity for a sprint → `workforce.module`  
> Creating a task / issue / WBS item / workspace settings → `workspace.module`  
>  
> Note: This module bridges SaaS accounts (people, HR) with workspace work items (tasks, milestones). Neither `workspace.module` nor `account.module` owns allocation scheduling.

## What this module owns

| Concern | Description |
|---------|-------------|
| WorkforceSchedule | Capacity plan for an org account's members |
| WorkAllocation | Assignment of an account to workspace work items |
| CapacityConstraint | Limits on how much work can be assigned per period |

## What this module does NOT own

| Concern | Owned by |
|---------|----------|
| Workspace settings / access control | `workspace.module` |
| Work items / milestones definition | `work.module` |
| Account / membership governance | `account.module` |

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
