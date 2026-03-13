# collaboration.module

**Bounded Context:** Collaboration / 協作  
**Layer:** Workspace (cross-cutting)

## Purpose

`collaboration.module` handles all real-time and async multi-participant interaction surfaces:
threaded comments, reactions, presence indicators, and co-editing sessions.

## What this module owns

| Concern | Description |
|---------|-------------|
| Comment | Threaded comments anchored to any artifact |
| Reaction | Emoji reactions on comments |
| Presence | Real-time presence indicators (viewing / editing / idle) |
| CoEditSession | CRDT / OT coordination signals for collaborative editing |

## Cross-module dependencies

| Module | Direction | Reason |
|--------|-----------|--------|
| `workspace.module` | → | Comments anchor to workspace artifacts (Issue, CR, QA) |
| `work.module` | → | Comments anchor to Work Items and Milestones |
| `file.module` | → | Inline comments anchor to file lines/blocks |
| `account.module` | → | Participants are Accounts; @mentions resolve to Account handles |
| `notification.module` | ← | MentionCommentPosted, ReviewRequested events trigger notifications |

## Standard 4-layer structure

```
collaboration.module/
├── index.ts
├── domain.collaboration/
│   ├── _entity.ts               # Comment + Thread + Reaction
│   ├── _value-objects.ts        # CommentId, ArtifactRef, ReactionType, PresenceState
│   ├── _ports.ts                # ICommentRepository, IPresencePort, ICoEditSessionPort
│   └── _events.ts               # CommentPosted, MentionCommentPosted, ReviewRequested
├── core/
│   ├── _use-cases.ts            # PostCommentUseCase, AddReactionUseCase, JoinPresenceUseCase
│   ├── _actions.ts
│   └── _queries.ts
├── infra.firestore/
└── _components/
```
