# Service Boundary / 服務邊界定義

Defines the contractual boundary between the SaaS Layer and Workspace Layer,
including ownership rules, crossing protocols, Workforce Scheduling bridge, and Context Mapping patterns.

> **MDDD reference**: Context Mapping terminology used in this document is defined in the
> [Technical Glossary — Context Mapping Patterns](../glossary/technical-terms.md#context-mapping-patterns--上下文映射模式)
> and the [Model-Driven Hexagonal Architecture guide](../notes/model-driven-hexagonal-architecture.md#6-context-mapping-in-xuanwu).

---

## Boundary Overview / 邊界總覽

```
┌─────────────────────────────────────────────────────────┐
│                     SaaS Layer                          │
│                                                         │
│  Account   Namespace   Team   Settlement   Social          │
│                                                         │
│              ┌──────────────────────┐                   │
│              │  Workforce Scheduling │  ← Bridge        │
│              │  (SaaS ↔ Workspace)  │                   │
│              └──────────────────────┘                   │
└──────────────────────┬──────────────────────────────────┘
                       │  Boundary
                       │  Crossed via: Event Bus + typed contracts
┌──────────────────────▼──────────────────────────────────┐
│                  Workspace Layer                         │
│                                                         │
│  Workspace   WBS   Issue   CR   Files   Intelligence    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Layer Ownership Rules / 層級所有權規則

### SaaS Layer owns

| Entity / Concept | Rationale |
|-----------------|-----------|
| Identity and authentication (`identity.module`) | Identity is platform-wide, not workspace-scoped |
| Account and Namespace | Billing and routing concerns belong to the platform |
| Team composition | Teams are an org-level access concept |
| Workforce Scheduling decisions | Staffing involves org-wide capacity |
| Settlement (AR / AP) | Financial records are org-level liabilities |
| Discovery Feed and Social Graph | Cross-workspace signals must be centrally aggregated |
| Achievement Engine | Badges represent platform-wide reputation |
| Notification routing | Recipients may span multiple workspaces |

### Workspace Layer owns

| Entity / Concept | Rationale |
|-----------------|-----------|
| WBS task structure and state | Work decomposition is specific to each project |
| Issue lifecycle | Issues are scoped to tasks inside one workspace |
| Change Request and baseline versioning | Governance is per-workspace |
| File storage and versions | Files belong to a workspace's access policy |
| Intelligence pipeline (parsing / extraction) | Processing is triggered by workspace file events |
| QA Review and Acceptance decisions | Quality gates are defined per workspace |
| Protected Baseline history | Audit trail is workspace-specific |

---

## Crossing Protocol / 跨層協定

Data and control flow across the boundary **only** via the following mechanisms.
Direct service-to-service calls between layers are not permitted.

### 1. Event Bus (primary)

The standard crossing mechanism. The emitting layer publishes a typed domain event.
The consuming layer subscribes and reacts asynchronously.

```
Workspace → SaaS:   wbs.task.state_changed { toState: "accepted" }
                    → Settlement Layer creates SettlementRecord

SaaS → Workspace:   workforce.schedule.approved { taskId, assigneeId, ... }
                    → WBS Module updates task assignee and scheduledStart
```

**Rules**
- Events are immutable after publication.
- Consumers must be idempotent — the same event may be delivered more than once.
- No event may contain a reference to an entity owned by the other layer's private store. Use IDs only.

### 2. Workforce Scheduling Bridge

The only service that **reads** from both layers by design.

```
Input  (from Workspace):  WorkforceRequest { taskId, skill, timeWindow, effort }
Input  (from SaaS):       Team capacity, member availability
Output (to Workspace):    AssignmentSchedule { taskId, assigneeId, start, end }
Output (to SaaS):         workforce.schedule.approved event
```

### 3. Workspace provisioning handshake

A synchronous two-phase operation at workspace creation time only.

```
Phase 1 (SaaS):    Register namespace slug, bind org FK
Phase 2 (Workspace): Initialize workspace record, create empty baseline
```

After Phase 2, all further mutation uses the Event Bus.

---

## Forbidden Operations / 禁止操作

### SaaS Layer must NOT

| Prohibition |
|-------------|
| Read or write WBS task fields directly |
| Open or resolve Issues on behalf of a user |
| Merge or reject Change Requests |
| Query the Baseline History for business logic |
| Assign an Assignee to a task without going through Workforce Scheduling |

### Workspace Layer must NOT

| Prohibition |
|-------------|
| Create or modify User identity records |
| Read or modify billing or AR/AP records |
| Query org-wide team capacity directly |
| Write to the Discovery Feed or Social Graph |
| Send notifications directly to users — all routing goes through Notification Engine |
| Validate an invitation or org membership |

---

## Settlement Trigger Contract / 結算觸發契約

> **⚠️ Implementation gap**: The event names below use the canonical dot format (`wbs.task.state_changed`). Current code emits `workspace:task:state:changed` (colon format). See the event naming note in [`event-catalog.md`](./event-catalog.md#event-naming-convention--事件命名規範) for context.

```
Workspace Layer emits:
  wbs.task.state_changed {
    taskId:      "task-abc"
    workspaceId: "ws-xyz"
    fromState:   "acceptance_review"
    toState:     "accepted"
    actorId:     "user-123"
  }

SaaS Layer (Settlement) reacts:
  1. Create SettlementRecord { taskId, workspaceId, ownerAccountId }
  2. Evaluate billing rules → create ARRecord if billable
  3. Evaluate pay rules    → create APRecord if assignee payable
  4. Emit settlement.ar_record.issued
  5. Emit settlement.ap_record.scheduled
```

The Workspace Layer does not know whether AR or AP records were created.

---

## Firestore Security Rules Strategy / Firestore 安全規則策略

> **⚠️ Implementation status**: The table below describes the **intended / target** security rules for each collection. The current `firestore.rules` file is minimal — it only covers the legacy `/users/{userId}` path with a catch-all deny rule. Full multi-collection rules implementation is a pending security task. See `docs/management/security-issues.md` for tracked gaps. Do **not** treat this table as reflecting the live production rules.

| Collection | Owner layer | Rule summary |
|------------|-------------|--------------|
| `identities` | SaaS (`identity.module`) | Read: own document only (Firebase Auth UID). Write: system only. |
| `accounts` | SaaS (`account.module`) | Read: authenticated accounts only. Write: own document only. |
| `organizations` | SaaS (alias view of `accounts` where accountType=organization) | Read: account members. Write: OrgOwner only. |
| `namespaces` | SaaS | Read: public for public workspaces. Write: system only. |
| `teams` | SaaS | Read: org members. Write: OrgOwner only. |
| `workspaces` | Workspace | Read: WorkspaceMember or public if `visibility=public`. Write: Maintainer only. |
| `wbs_tasks` | Workspace | Read: WorkspaceMember. Write: Assignee (own tasks), Maintainer (all). |
| `issues` | Workspace | Read: WorkspaceMember. Write: Assignee, Maintainer. |
| `change_requests` | Workspace | Read: WorkspaceMember. Write: CR author, Maintainer. |
| `files` | Workspace | Read: per `accessScope`. Write: WorkspaceMember with write role. |
| `parsed_documents` | Workspace | Read: WorkspaceMember. Write: system (Intelligence service) only. |
| `extracted_objects` | Workspace | Read: WorkspaceMember. Write: system only. |
| `workforce_requests` | Bridge | Read: OrgOwner, Maintainer. Write: WBS Module (system). |
| `assignment_schedules` | Bridge | Read: Assignee, OrgOwner. Write: Workforce Scheduling (system). |
| `settlement_records` | SaaS | Read: OrgOwner. Write: system only. |
| `ar_records` | SaaS | Read: OrgOwner. Write: system only. |
| `ap_records` | SaaS | Read: OrgOwner, Assignee (own). Write: system only. |

---

## Context Map / 上下文映射圖

This table records the **integration relationship pattern** between every pair of Bounded Contexts that directly communicate. For pattern definitions see the [Technical Glossary](../glossary/technical-terms.md#context-mapping-patterns--上下文映射模式).

| Upstream Context | Downstream Context | Pattern | Notes |
|------------------|--------------------|---------|-------|
| `identity.module` | `account.module` | **Upstream / Downstream + ACL** | `account.module` translates Firebase Auth user into `AccountDTO`; the ACL lives in `infra.firebase/_mapper.ts` |
| `account.module` | `namespace.module` | **Customer / Supplier** | `namespace.module` negotiates slug-path resolution contracts with `account.module` |
| `account.module` | `workspace.module` | **Upstream / Downstream + ACL** | `workspace.module` translates org/user identities into workspace-scoped `WorkspaceMember`; ACL in `infra.firestore/_mapper.ts` |
| `workspace.module` | `settlement.module` | **Open Host Service (Event Bus)** | `settlement.module` subscribes to `wbs.task.state_changed{toState:"accepted"}` via Published Language; no direct coupling |
| `workspace.module` | `notification.module` | **Open Host Service (Event Bus)** | `notification.module` subscribes to workspace events; uses only event payload, no workspace domain objects |
| `workspace.module` ↔ `workforce.module` | — | **Partnership (Bridge)** | Workforce Scheduling reads from both layers by design; co-evolved under mutual interface agreement |
| `account.module` | `achievement.module` | **Open Host Service (Event Bus)** | Achievement engine reacts to qualifying activity events; writes badges back via `IAccountBadgeWritePort` (ACL port) |
| `workspace.module` | `audit.module` | **Conformist** | Audit module records events exactly as emitted without translation |
| `workspace.module` | `search.module` | **Open Host Service (Event Bus)** | Search subscribes to entity-created / entity-updated events to maintain the search index |
| `workspace.module` | `collaboration.module` | **Partnership** | Collaboration attaches to workspace entities; both modules co-evolve presence and co-editing contracts |
| `workspace.module` | `social.module` | **Conformist (event consumer)** | Social feed subscribes to public workspace events without model translation |
| `(all modules)` | `notification.module` | **Published Language** | All event payloads use `EventEnvelope` — the Published Language shared across all contexts |
| `(all modules)` | `src/shared/` | **Shared Kernel** | `AppError`, `Result<T,E>`, `PaginatedResult`, i18n utilities, and port interfaces in `src/shared/` form the Shared Kernel |

### Anticorruption Layer Implementation Sites

| ACL Location | Translates | From | To |
|-------------|------------|------|----|
| `identity.module/infra.firebase/_mapper.ts` | Firebase Auth user | `FirebaseUser` (external) | `IdentityUser` (domain) |
| `account.module/infra.firestore/_repository.ts` | Firestore document | `DocumentData` | `AccountDTO` |
| `workspace.module/infra.firestore/_repository.ts` | Firestore document | `DocumentData` | `Workspace` aggregate |
| `workforce.module/infra.*/` | Org capacity data | SaaS org model | WBS skill/time-window terms |
