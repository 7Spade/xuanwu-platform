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

## Domain Governance（必填）

### 1. 上下文邊界（Bounded Context）
- 本模組邊界：**Collaboration / 協作互動（留言、反應、Presence）**。
- 僅允許透過 `src/modules/collaboration.module/index.ts` 對外暴露能力；禁止跨模組直連 `core/`、`domain.*`、`infra.*`、`_components/`。

### 2. 核心域與支撐域識別
- 本模組定位：**支撐域**。
- 核心能力放在 `domain.*` + `core/`；跨域整合、通知、搜尋等配套能力視為支撐能力，由應用層編排。

### 3. 上下文映射（Context Mapping）
- 主要上下游關聯：**Workspace、Identity、Notification**。
- 跨上下文資料交換需使用 DTO／事件，不共享對方內部實體。

### 4. 防腐層（Anti-Corruption Layer）
- 外部系統（Firebase / Upstash / 外部 API）必須封裝在 `infra.*`。
- 使用 Mapper / Adapter 將外部資料格式轉換為本域 Value Object 與 Entity，避免污染領域模型。

### 5. 核心業務邏輯
- 不變條件（invariants）與規則放在 `domain.*`（Entity / VO / Domain Service）。
- `core/_use-cases.ts` 僅做流程協調：載入 → 套用規則 → 透過 Port 持久化 → 發布事件。

### 6. 操作流程
1. Presentation（`_components/` 或 `src/app`）呼叫模組公開 Action/Query。
2. Application（`core/`）執行用例並調用 Domain。
3. Domain 計算狀態變更與事件。
4. Infrastructure（`infra.*`）透過 Port 落地 I/O。

### 7. 模組間契約
- 同步契約：`index.ts` 匯出的 Action / Query / DTO。
- 非同步契約：Domain Event payload（版本化、向後相容）。
- 契約變更需先更新 README 與呼叫端，避免破壞既有流程。
