# Service Boundary / 服務邊界定義

Defines the contractual boundary between the SaaS Layer and Workspace Layer,
including ownership rules, crossing protocols, and the Workforce Scheduling bridge.

---

## Boundary Overview / 邊界總覽

```
┌─────────────────────────────────────────────────────────┐
│                     SaaS Layer                          │
│                                                         │
│  Organization   Namespace   Team   Settlement   Social  │
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
| User identity and authentication | Identity is platform-wide, not workspace-scoped |
| Organization and Namespace | Billing and routing concerns belong to the platform |
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
  1. Create SettlementRecord { taskId, workspaceId, orgId }
  2. Evaluate billing rules → create ARRecord if billable
  3. Evaluate pay rules    → create APRecord if assignee payable
  4. Emit settlement.ar_record.issued
  5. Emit settlement.ap_record.scheduled
```

The Workspace Layer does not know whether AR or AP records were created.

---

## Firestore Security Rules Strategy / Firestore 安全規則策略

| Collection | Owner layer | Rule summary |
|------------|-------------|--------------|
| `users` | SaaS | Read: authenticated users only. Write: own document only. |
| `organizations` | SaaS | Read: org members. Write: OrgOwner only. |
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
