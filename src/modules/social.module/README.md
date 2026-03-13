# social.module

**Bounded Context:** Social Graph · Feed · Discovery  
**Layer:** SaaS

## Purpose

`social.module` manages the social interaction layer:
the follow/star/watch graph, activity feed, and discovery surfaces.

## What this module owns

| Concern | Description |
|---------|-------------|
| SocialEdge | Follow / star / watch relationships between Accounts and Workspaces |
| Feed | Activity stream aggregated from social graph events |
| Discovery | Trending workspaces, recommended accounts |

## Cross-module dependencies

| Module | Direction | Reason |
|--------|-----------|--------|
| `account.module` | → | Social actors and targets are Accounts |
| `workspace.module` | → | Starred/watched targets include workspaces |
| `notification.module` | ← | Follow events may trigger notifications |

## Standard 4-layer structure

```
social.module/
├── index.ts
├── domain.social/
│   ├── _entity.ts               # SocialEdge + FeedEntry
│   ├── _value-objects.ts
│   ├── _ports.ts
│   └── _events.ts
├── core/
├── infra.firestore/
└── _components/
```
