# workspace.module

**Bounded Context:** Workspace · WBS · Issue · CR · QA · Acceptance · Baseline  
**Layer:** Workspace

## Purpose

`workspace.module` is the primary **project planning and delivery** bounded context.
It answers the question: **"What is being planned and delivered in this workspace?"**

It owns the planning and delivery lifecycle: breakdown structure, issues,
change requests, QA, acceptance, and baselines.

> **Boundary vs `workforce.module`:**  
> `workspace.module` = "What is the workspace and what work is planned?" (project scope, structure, settings, access control)  
> `workforce.module` = "Who is doing the work and when?" (capacity, scheduling, person-to-work allocation)  
>  
> Workspace creation / members list / WBS tasks / issues → `workspace.module`  
> Who is assigned to which task / how much capacity is available → `workforce.module`  
>  
> Note: Workspace members (who has *access*) are stored here as an access-control list.
>   Their **scheduling and capacity allocation** belongs to `workforce.module` — workforce answers "when and how much", workspace answers "who is allowed in".

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

## What this module does NOT own

| Concern | Owned by |
|---------|----------|
| Workforce capacity planning | `workforce.module` |
| Work item assignment / allocation scheduling | `workforce.module` |
| Work items and milestones | `work.module` |
| Fork (planning branches) | `fork.module` |

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
