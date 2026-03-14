# fork.module

**Bounded Context:** Fork Network  
**Layer:** Workspace

## Purpose

`fork.module` manages the Fork Network: planning branches forked from a workspace,
independent divergence, and merge-back via Change Requests.

## What this module owns

| Concern | Description |
|---------|-------------|
| Fork | A planning branch derived from a parent workspace |
| ForkDivergence | Tracked changes made on a fork relative to its parent |
| MergeProposal | Formal proposal to merge fork changes back via CR |

## Cross-module dependencies

| Module | Direction | Reason |
|--------|-----------|--------|
| `workspace.module` | → | Forks branch from a parent workspace |
| `account.module` | → | Fork owner is an Account |
| `collaboration.module` | ← | Comments on merge proposals |
| `notification.module` | ← | Merge proposal events trigger notifications |

## Standard 4-layer structure

```
fork.module/
├── index.ts
├── domain.fork/
│   ├── _entity.ts               # Fork + ForkDivergence + MergeProposal
│   ├── _value-objects.ts
│   ├── _ports.ts
│   └── _events.ts
├── core/
├── infra.firestore/
└── _components/
```
