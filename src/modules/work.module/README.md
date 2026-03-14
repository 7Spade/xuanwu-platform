# work.module

**Bounded Context:** Work Items · Milestones · Dependencies  
**Layer:** Workspace

## Purpose

`work.module` manages the Work Item layer — tasks, milestones, and dependency tracking.
This is distinct from WBS Tasks in `workspace.module`: Work Items represent the execution
layer with assignments, status tracking, and inter-item dependencies.

## What this module owns

| Concern | Description |
|---------|-------------|
| WorkItem | Assignable unit of work with status, priority, and estimates |
| Milestone | Date-bound delivery checkpoint grouping Work Items |
| Dependency | Directional relationship between Work Items (blocks / depends-on) |

## Cross-module dependencies

| Module | Direction | Reason |
|--------|-----------|--------|
| `workspace.module` | → | Work Items live within a workspace context |
| `account.module` | → | Work Items are assigned to Accounts |
| `collaboration.module` | ← | Comments anchor to Work Items |
| `notification.module` | ← | Assignment and status change events trigger notifications |

## Standard 4-layer structure

```
work.module/
├── index.ts
├── domain.work/
│   ├── _entity.ts               # WorkItem + Milestone + Dependency
│   ├── _value-objects.ts
│   ├── _ports.ts
│   └── _events.ts
├── core/
├── infra.firestore/
└── _components/
```
