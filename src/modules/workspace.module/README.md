# workspace.module

**Bounded Context:** Workspace · WBS · Issue · CR · QA · Acceptance · Baseline  
**Layer:** Workspace

## Purpose

`workspace.module` is the primary Workspace bounded context.
It owns the planning and delivery lifecycle: breakdown structure, issues,
change requests, QA, acceptance, and baselines.

## What this module owns

| Concern | Description |
|---------|-------------|
| Workspace | Root aggregate: settings, members, access control |
| WBS Task | Work breakdown structure tasks |
| Issue | Bug reports, requests, and planning issues |
| Change Request (CR) | Formal change proposals with approval workflow |
| QA Review | Quality assurance sign-off flow |
| Acceptance | Stakeholder acceptance records |
| Baseline | Snapshot of approved scope/schedule |

## Cross-module dependencies

| Module | Direction | Reason |
|--------|-----------|--------|
| `namespace.module` | → | Workspace is registered under a namespace |
| `account.module` | → | Workspace members are Accounts |
| `work.module` | ← | Work Items and Milestones reference workspace context |
| `fork.module` | ← | Forks are branched from a workspace |
| `collaboration.module` | ← | Comments and reviews anchor to workspace artifacts |
| `audit.module` | ← | Governance rules evaluated against workspace artifacts |
| `notification.module` | ← | Workspace events trigger notifications |

## Standard 4-layer structure

```
workspace.module/
├── index.ts
├── domain.workspace/
│   ├── _entity.ts               # Workspace + WBS + Issue + CR + QA + Acceptance + Baseline
│   ├── _value-objects.ts
│   ├── _ports.ts
│   └── _events.ts
├── core/
│   ├── _use-cases.ts
│   ├── _actions.ts
│   └── _queries.ts
├── infra.firestore/
└── _components/
```
