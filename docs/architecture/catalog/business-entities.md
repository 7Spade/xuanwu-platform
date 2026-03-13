# Business Entities / 核心業務實體

Canonical definitions of every first-class domain object in the system.
Each entity maps directly to a Firestore collection and a bounded context boundary.

---

## Entity Overview / 實體總覽

```
SaaS Layer
├── User
├── Organization
├── Namespace
├── Team
│   └── TeamMember
└── UserProfile

Workspace Layer
├── Workspace
│   └── WorkspaceMember
├── Epic
├── Milestone
│   └── MilestoneTask
├── WBSTask
│   └── TaskDependency
├── Issue
├── ChangeRequest
│   └── CRReview
├── MergeQueue
└── BaselineHistory

File and Intelligence Layer
├── File
│   └── FileVersion
├── ParsedDocument
└── ExtractedObject

Workforce Layer (SaaS ↔ Workspace boundary)
├── WorkforceRequest
└── AssignmentSchedule

Settlement Layer
├── SettlementRecord
├── ARRecord
└── APRecord
```

---

## SaaS Layer Entities / SaaS 層實體

---

### User / 使用者

The root identity entity. Every actor in the system is a User.

| Field | Type | Notes |
|-------|------|-------|
| `uid` | `string` | Firebase Auth UID — primary key |
| `email` | `string` | Verified email address |
| `displayName` | `string` | Public display name |
| `avatarUrl` | `string` | Profile image URL |
| `personalNamespaceId` | `string` | FK → Namespace created at registration |
| `createdAt` | `timestamp` | |
| `updatedAt` | `timestamp` | |

**Invariants**
- A User always has exactly one personal Namespace upon registration.
- A User may belong to zero or more Organizations via TeamMember.
- A User may own zero or more Organizations directly.

**Relationships**
- `1 User → 1 Namespace` (personal)
- `1 User → N TeamMember`
- `1 User → N WorkspaceMember`
- `1 User → N WBSTask` (as assignee)

---

### Organization / 組織

The top-level billing and governance unit. Groups workspaces and members.

| Field | Type | Notes |
|-------|------|-------|
| `orgId` | `string` | UUID — primary key |
| `namespaceId` | `string` | FK → Namespace (org-scoped) |
| `displayName` | `string` | |
| `slug` | `string` | URL-safe, immutable after creation |
| `ownerId` | `string` | FK → User |
| `billingStatus` | `string` | `active \| suspended \| cancelled` |
| `createdAt` | `timestamp` | |

**Invariants**
- An Organization must have exactly one registered Namespace.
- The creating User becomes the initial OrgOwner.
- An Organization owns zero or more Workspaces.
- Deleting an Organization requires all Workspaces to be archived first.

**Relationships**
- `1 Org → 1 Namespace`
- `1 Org → N Team`
- `1 Org → N Workspace`
- `1 Org → N ARRecord` (as billing entity)

---

### Namespace / 命名空間

A unique, URL-safe path prefix scoping all workspace addresses.

| Field | Type | Notes |
|-------|------|-------|
| `namespaceId` | `string` | UUID — primary key |
| `slug` | `string` | Globally unique. e.g. `acme` or `john` |
| `type` | `string` | `org \| personal` |
| `ownerId` | `string` | FK → Organization or User |
| `createdAt` | `timestamp` | |

**Invariants**
- Slug is globally unique and immutable once registered.
- A Namespace of type `org` is owned by exactly one Organization.
- A Namespace of type `personal` is owned by exactly one User.
- All Workspaces under this namespace inherit the slug as a path prefix: `{slug}/{workspace-slug}`.

---

### Team / 團隊

A named group of org members used to manage workspace access in bulk.

| Field | Type | Notes |
|-------|------|-------|
| `teamId` | `string` | UUID — primary key |
| `orgId` | `string` | FK → Organization |
| `name` | `string` | Display name |
| `slug` | `string` | URL-safe. Unique within org. |
| `description` | `string` | Optional |
| `createdAt` | `timestamp` | |

**Invariants**
- A Team belongs to exactly one Organization.
- A Team can be assigned to one or more Workspaces as a permissions group.
- `@team` mentions in a ChangeRequest route review notifications to all TeamMembers.

---

### TeamMember / 團隊成員

Junction entity binding a User to a Team with a role.

| Field | Type | Notes |
|-------|------|-------|
| `teamMemberId` | `string` | UUID — primary key |
| `teamId` | `string` | FK → Team |
| `userId` | `string` | FK → User |
| `role` | `string` | `member \| lead` |
| `joinedAt` | `timestamp` | |

---

### UserProfile / 使用者檔案

The public-facing representation of a User. Separated from User to allow independent read scaling.

| Field | Type | Notes |
|-------|------|-------|
| `profileId` | `string` | Same as `uid` — 1:1 with User |
| `displayName` | `string` | Denormalized from User |
| `avatarUrl` | `string` | Denormalized from User |
| `bio` | `string` | Optional |
| `badges` | `string[]` | Achievement badge IDs earned |
| `contributionSummary` | `map` | Accepted task count by month |
| `followerCount` | `number` | |
| `followingCount` | `number` | |
| `updatedAt` | `timestamp` | |

---

## Workspace Layer Entities / Workspace 層實體

---

### Workspace / 工作空間

The primary logical container for a project or engagement. Analogous to a GitHub repository but for operational work.

| Field | Type | Notes |
|-------|------|-------|
| `workspaceId` | `string` | UUID — primary key |
| `namespaceId` | `string` | FK → Namespace |
| `orgId` | `string` | FK → Organization. `null` if personal |
| `displayName` | `string` | |
| `slug` | `string` | Unique within namespace |
| `ownerId` | `string` | FK → User |
| `visibility` | `string` | `public \| private` |
| `baselineRef` | `string` | FK → BaselineHistory (latest accepted) |
| `createdAt` | `timestamp` | |
| `archivedAt` | `timestamp` | `null` if active |

**Invariants**
- A Workspace must belong to a Namespace (org or personal).
- The workspace full path is `{namespace-slug}/{workspace-slug}`.
- A Workspace has exactly one Protected Baseline at any point in time.
- Archiving a Workspace freezes all mutation operations.

---

### WorkspaceMember / 工作空間成員

Grants a User or Team scoped access to a Workspace.

| Field | Type | Notes |
|-------|------|-------|
| `memberId` | `string` | UUID — primary key |
| `workspaceId` | `string` | FK → Workspace |
| `userId` | `string` | FK → User. `null` if team grant |
| `teamId` | `string` | FK → Team. `null` if direct user grant |
| `role` | `string` | `maintainer \| collaborator` |
| `grantedById` | `string` | FK → User (who made the grant) |
| `grantedAt` | `timestamp` | |

---

### Epic / 史詩

A large body of work composed of multiple WBS tasks sharing a business objective.

| Field | Type | Notes |
|-------|------|-------|
| `epicId` | `string` | UUID — primary key |
| `workspaceId` | `string` | FK → Workspace |
| `title` | `string` | |
| `description` | `string` | |
| `status` | `string` | `active \| completed \| archived` |
| `createdById` | `string` | FK → User |
| `createdAt` | `timestamp` | |
| `completedAt` | `timestamp` | `null` until all tasks accepted |

---

### Milestone / 里程碑

A time-bound checkpoint grouping tasks into a delivery stage.

| Field | Type | Notes |
|-------|------|-------|
| `milestoneId` | `string` | UUID — primary key |
| `workspaceId` | `string` | FK → Workspace |
| `title` | `string` | |
| `dueDate` | `timestamp` | |
| `status` | `string` | `open \| closed` |
| `createdById` | `string` | FK → User |
| `createdAt` | `timestamp` | |

---

### MilestoneTask / 里程碑任務關聯

Junction entity linking WBS tasks to Milestones.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID — primary key |
| `milestoneId` | `string` | FK → Milestone |
| `taskId` | `string` | FK → WBSTask |

---

### WBSTask / WBS 任務

The atomic unit of work. Central entity of the entire system.

| Field | Type | Notes |
|-------|------|-------|
| `taskId` | `string` | UUID — primary key |
| `workspaceId` | `string` | FK → Workspace |
| `parentTaskId` | `string` | FK → WBSTask. `null` if root task |
| `epicId` | `string` | FK → Epic. `null` if standalone |
| `title` | `string` | |
| `description` | `string` | |
| `assigneeId` | `string` | FK → User. Set by AssignmentSchedule |
| `state` | `string` | See state machine below |
| `scheduledStart` | `timestamp` | Set by Workforce Scheduling |
| `scheduledEnd` | `timestamp` | Set by Workforce Scheduling |
| `effortEstimate` | `number` | Person-hours |
| `skillRequirement` | `string[]` | Tags used for workforce matching |
| `createdById` | `string` | FK → User (Maintainer who created) |
| `createdAt` | `timestamp` | |
| `updatedAt` | `timestamp` | |
| `acceptedAt` | `timestamp` | `null` until state = `accepted` |

**State machine values**  
`pending` → `in_progress` → `done` → `qa_in_review` → `acceptance_review` → `accepted`  
Lateral: `in_progress` ↔ `blocked`  
Regression: `qa_in_review` → `in_progress` / `acceptance_review` → `in_progress`

See [state-machine diagram](../diagrams/state-machine.mermaid).

---

### TaskDependency / 任務依賴

Enforces execution sequencing between two WBS tasks.

| Field | Type | Notes |
|-------|------|-------|
| `dependencyId` | `string` | UUID — primary key |
| `upstreamTaskId` | `string` | FK → WBSTask (must complete first) |
| `downstreamTaskId` | `string` | FK → WBSTask (blocked until upstream done) |
| `type` | `string` | `finish_to_start \| start_to_start` |

---

### Issue / 議題

A discrete blocker or defect raised against a WBS task.

| Field | Type | Notes |
|-------|------|-------|
| `issueId` | `string` | UUID — primary key |
| `workspaceId` | `string` | FK → Workspace |
| `sequentialNumber` | `number` | Monotonically incrementing per workspace. Displayed as `#1`, `#2` |
| `linkedTaskId` | `string` | FK → WBSTask |
| `title` | `string` | |
| `description` | `string` | |
| `state` | `string` | `open \| resolved` |
| `openedById` | `string` | FK → User |
| `resolvedById` | `string` | FK → User. `null` until resolved |
| `openedAt` | `timestamp` | |
| `resolvedAt` | `timestamp` | `null` until resolved |

**Invariants**
- A WBSTask with one or more `open` Issues transitions to `blocked`.
- Resolving the last open Issue on a task transitions the task back to `in_progress`.

---

### ChangeRequest / 變更請求

A versioned proposal to update the Protected Baseline.

| Field | Type | Notes |
|-------|------|-------|
| `crId` | `string` | UUID — primary key |
| `workspaceId` | `string` | FK → Workspace |
| `taskId` | `string` | FK → WBSTask |
| `snapshotRef` | `string` | Reference to the submitted work snapshot |
| `state` | `string` | `open \| changes_requested \| approved \| merged \| closed` |
| `authorId` | `string` | FK → User (Assignee) |
| `mergeQueueId` | `string` | FK → MergeQueue. `null` if direct merge |
| `createdAt` | `timestamp` | |
| `mergedAt` | `timestamp` | `null` until merged |

---

### CRReview / 變更請求審查

A single reviewer's decision on a ChangeRequest.

| Field | Type | Notes |
|-------|------|-------|
| `reviewId` | `string` | UUID — primary key |
| `crId` | `string` | FK → ChangeRequest |
| `reviewerId` | `string` | FK → User |
| `decision` | `string` | `approved \| changes_requested` |
| `comment` | `string` | Optional |
| `reviewedAt` | `timestamp` | |

---

### MergeQueue / 合併佇列

An optional governance gate that serializes and validates groups of ChangeRequests.

| Field | Type | Notes |
|-------|------|-------|
| `queueId` | `string` | UUID — primary key |
| `workspaceId` | `string` | FK → Workspace |
| `state` | `string` | `pending \| validating \| merged \| failed` |
| `createdAt` | `timestamp` | |
| `processedAt` | `timestamp` | `null` until processed |

---

### BaselineHistory / 基線歷史

Append-only log of every successful merge into the Protected Baseline.

| Field | Type | Notes |
|-------|------|-------|
| `historyId` | `string` | UUID — primary key |
| `workspaceId` | `string` | FK → Workspace |
| `crId` | `string` | FK → ChangeRequest |
| `mergedById` | `string` | FK → User (Maintainer) |
| `snapshotRef` | `string` | Immutable reference to the merged content |
| `mergedAt` | `timestamp` | |

**Invariants**
- Never deleted or updated. Append-only.
- Each record advances the workspace `baselineRef`.

---

## File and Intelligence Layer Entities / 檔案與智能層實體

---

### File / 檔案

Logical file record. Stable across version updates.

| Field | Type | Notes |
|-------|------|-------|
| `fileId` | `string` | UUID — primary key |
| `workspaceId` | `string` | FK → Workspace |
| `uploadedById` | `string` | FK → User |
| `name` | `string` | Original filename |
| `mimeType` | `string` | |
| `currentVersionId` | `string` | FK → FileVersion (latest) |
| `uploadedAt` | `timestamp` | |

---

### FileVersion / 檔案版本

Immutable snapshot of a file's binary content at a point in time.

| Field | Type | Notes |
|-------|------|-------|
| `versionId` | `string` | UUID — primary key |
| `fileId` | `string` | FK → File |
| `storageUri` | `string` | Firebase Storage path |
| `sizeBytes` | `number` | |
| `uploadedById` | `string` | FK → User |
| `createdAt` | `timestamp` | |

**Invariants**
- Never deleted. Append-only.
- A new upload to an existing File creates a new FileVersion and updates `File.currentVersionId`.

---

### ParsedDocument / 解析後文件

Structured output from Document Parsing for a specific FileVersion.

| Field | Type | Notes |
|-------|------|-------|
| `parseId` | `string` | UUID — primary key |
| `fileId` | `string` | FK → File |
| `fileVersionId` | `string` | FK → FileVersion |
| `rawText` | `string` | Full extracted plain text |
| `structureJson` | `string` | Heading tree, tables, metadata as JSON |
| `state` | `string` | `pending \| completed \| failed` |
| `parsedAt` | `timestamp` | `null` until completed |

---

### ExtractedObject / 提取物件

A single actionable entity extracted from a ParsedDocument.

| Field | Type | Notes |
|-------|------|-------|
| `objectId` | `string` | UUID — primary key |
| `parseId` | `string` | FK → ParsedDocument |
| `type` | `string` | `date \| amount \| party \| deliverable \| obligation` |
| `value` | `string` | Raw extracted value |
| `normalizedValue` | `string` | Parsed / formatted value (ISO date, numeric amount) |
| `confidence` | `number` | Model confidence score `0.0–1.0` |
| `linkedTaskId` | `string` | FK → WBSTask. `null` if unlinked |
| `linkedWorkItemId` | `string` | FK → WorkItem. `null` if unlinked |
| `extractedAt` | `timestamp` | |

---

## Workforce Layer Entities / 人力層實體

---

### WorkforceRequest / 人力需求請求

A request submitted by a Workspace for task staffing.

| Field | Type | Notes |
|-------|------|-------|
| `requestId` | `string` | UUID — primary key |
| `workspaceId` | `string` | FK → Workspace |
| `taskId` | `string` | FK → WBSTask |
| `skillRequirement` | `string[]` | Required skills for the task |
| `preferredStart` | `timestamp` | |
| `preferredEnd` | `timestamp` | |
| `effortHours` | `number` | |
| `state` | `string` | `pending \| scheduled \| approved` |
| `requestedAt` | `timestamp` | |

---

### AssignmentSchedule / 指派排程

The approved output of Workforce Scheduling. Binds a member to a task with a confirmed time window.

| Field | Type | Notes |
|-------|------|-------|
| `scheduleId` | `string` | UUID — primary key |
| `requestId` | `string` | FK → WorkforceRequest |
| `taskId` | `string` | FK → WBSTask |
| `assigneeId` | `string` | FK → User |
| `scheduledStart` | `timestamp` | |
| `scheduledEnd` | `timestamp` | |
| `approvedById` | `string` | FK → User (OrgOwner) |
| `approvedAt` | `timestamp` | |

---

## Settlement Layer Entities / 結算層實體

---

### SettlementRecord / 結算記錄

Root record triggered when a WBSTask reaches `accepted`. Parent of AR and AP records.

| Field | Type | Notes |
|-------|------|-------|
| `settlementId` | `string` | UUID — primary key |
| `taskId` | `string` | FK → WBSTask |
| `workspaceId` | `string` | FK → Workspace |
| `orgId` | `string` | FK → Organization |
| `triggerEvent` | `string` | Always `task_accepted` |
| `triggeredAt` | `timestamp` | |

---

### ARRecord / 應收帳款記錄

Represents money owed to the organization by a client.

| Field | Type | Notes |
|-------|------|-------|
| `arId` | `string` | UUID — primary key |
| `settlementId` | `string` | FK → SettlementRecord |
| `orgId` | `string` | FK → Organization |
| `clientId` | `string` | FK → User or external client ref |
| `invoiceRef` | `string` | Generated invoice document reference |
| `amount` | `number` | |
| `currency` | `string` | ISO 4217 e.g. `TWD`, `USD` |
| `state` | `string` | `pending \| issued \| paid` |
| `issuedAt` | `timestamp` | `null` until issued |
| `paidAt` | `timestamp` | `null` until paid |

---

### APRecord / 應付帳款記錄

Represents money owed to an assignee or vendor by the organization.

| Field | Type | Notes |
|-------|------|-------|
| `apId` | `string` | UUID — primary key |
| `settlementId` | `string` | FK → SettlementRecord |
| `assigneeId` | `string` | FK → User |
| `amount` | `number` | |
| `currency` | `string` | ISO 4217 |
| `state` | `string` | `pending \| scheduled \| paid` |
| `scheduledAt` | `timestamp` | Payment scheduled date |
| `paidAt` | `timestamp` | `null` until paid |
