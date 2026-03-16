# Business Entities / 核心業務實體

Canonical definitions of every first-class domain object in the system.
Each entity maps directly to a Firestore collection and a bounded context boundary.

> **SSOT reference**: Entity ownership and module boundaries are defined in
> [`docs/architecture/notes/model-driven-hexagonal-architecture.md`](../notes/model-driven-hexagonal-architecture.md).
> `account.module` is the authoritative bounded context for all Account aggregates.
> `identity.module` owns auth credentials and sessions — it does **not** own Account data.

---

## Entity Overview / 實體總覽

```
SaaS Layer
├── Account  (accountType: personal | organization)
├── Namespace
├── Team
│   └── TeamMember
└── AccountProfile

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

### Account / 帳號

The unified platform account. Represents both individual people (`personal`) and organizations (`organization`). Owned by `account.module`.

> **Auth boundary**: Firebase Auth credentials (UID, provider tokens, sessions) are managed by
> `identity.module`. The `account.module` maps the identity UID to an Account aggregate at
> first login and owns all platform-level account data from that point forward.

| Field | Type | Notes |
|-------|------|-------|
| `accountId` | `string` | UUID — primary key |
| `accountType` | `string` | `personal \| organization` |
| `email` | `string` | Verified email address |
| `displayName` | `string` | Public display name |
| `avatarUrl` | `string` | Profile image URL |
| `namespaceId` | `string` | FK → Namespace (personal accounts: personal namespace; org accounts: org namespace) |
| `billingStatus` | `string` | `active \| suspended \| cancelled` — organization accounts only |
| `createdAt` | `timestamp` | |
| `updatedAt` | `timestamp` | |

**Invariants**
- An Account of type `personal` always has exactly one personal Namespace upon registration.
- An Account of type `organization` must have exactly one org-scoped Namespace.
- Only `organization`-type Accounts own Teams and Workspaces at the org level.
- Deleting an organization Account requires all Workspaces to be archived first.

**Relationships**
- `1 Account → 1 Namespace`
- `1 Account → N TeamMember` (personal accounts participate as members)
- `1 Account → N WorkspaceMember`
- `1 Account → N WBSTask` (as assignee)
- `1 Account (organization) → N Team`
- `1 Account (organization) → N Workspace`
- `1 Account (organization) → N ARRecord` (as billing entity)

---

### Organization → Account (accountType: organization)

> **Removed as a separate entity.** Organizations are now represented as `Account` records
> with `accountType = "organization"`. See [Account](#account--帳號) above.
>
> `orgId` foreign-key references throughout this document refer to `Account.accountId`
> where `accountType = "organization"`. The `account.module` is the owning bounded context.
> The `org.module` has been removed; Team and Membership logic is absorbed into `account.module`.

---

### Namespace / 命名空間

A unique, URL-safe path prefix scoping all workspace addresses.

| Field | Type | Notes |
|-------|------|-------|
| `namespaceId` | `string` | UUID — primary key |
| `slug` | `string` | Globally unique. e.g. `acme` or `john` |
| `type` | `string` | `org \| personal` |
| `ownerId` | `string` | FK → Account (personal or organization) |
| `createdAt` | `timestamp` | |

**Invariants**
- Slug is globally unique and immutable once registered.
- A Namespace of type `org` is owned by exactly one Account (accountType=organization).
- A Namespace of type `personal` is owned by exactly one Account (accountType=personal).
- All Workspaces under this namespace inherit the slug as a path prefix: `{slug}/{workspace-slug}`.

---

### Team / 團隊

A named group of org members used to manage workspace access in bulk.

| Field | Type | Notes |
|-------|------|-------|
| `teamId` | `string` | UUID — primary key |
| `orgId` | `string` | FK → Account (accountType=organization) |
| `name` | `string` | Display name |
| `slug` | `string` | URL-safe. Unique within org. |
| `description` | `string` | Optional |
| `createdAt` | `timestamp` | |

**Invariants**
- A Team belongs to exactly one organization Account.
- A Team can be assigned to one or more Workspaces as a permissions group.
- `@team` mentions in a ChangeRequest route review notifications to all TeamMembers.

---

### TeamMember / 團隊成員

Junction entity binding an Account to a Team with a role.

| Field | Type | Notes |
|-------|------|-------|
| `teamMemberId` | `string` | UUID — primary key |
| `teamId` | `string` | FK → Team |
| `accountId` | `string` | FK → Account |
| `role` | `string` | `member \| lead` |
| `joinedAt` | `timestamp` | |

---

### AccountProfile / 帳號檔案

The public-facing representation of an Account. A sub-aggregate of `account.module`,
separated from Account to allow independent read scaling.

| Field | Type | Notes |
|-------|------|-------|
| `profileId` | `string` | Same as `accountId` — 1:1 with Account |
| `displayName` | `string` | Denormalized from Account |
| `avatarUrl` | `string` | Denormalized from Account |
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
| `orgId` | `string` | FK → Account (accountType=organization). `null` if personal |
| `displayName` | `string` | |
| `slug` | `string` | Unique within namespace |
| `ownerId` | `string` | FK → Account |
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

Grants an Account or Team scoped access to a Workspace.

| Field | Type | Notes |
|-------|------|-------|
| `memberId` | `string` | UUID — primary key |
| `workspaceId` | `string` | FK → Workspace |
| `accountId` | `string` | FK → Account. `null` if team grant |
| `teamId` | `string` | FK → Team. `null` if direct account grant |
| `role` | `string` | `maintainer \| collaborator` |
| `grantedById` | `string` | FK → Account (who made the grant) |
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
| `createdById` | `string` | FK → Account |
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
| `createdById` | `string` | FK → Account |
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
| `assigneeId` | `string` | FK → Account. Set by AssignmentSchedule |
| `state` | `string` | See state machine below |
| `scheduledStart` | `timestamp` | Set by Workforce Scheduling |
| `scheduledEnd` | `timestamp` | Set by Workforce Scheduling |
| `effortEstimate` | `number` | Person-hours |
| `skillRequirement` | `string[]` | Tags used for workforce matching |
| `createdById` | `string` | FK → Account (Maintainer who created) |
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
| `openedById` | `string` | FK → Account |
| `resolvedById` | `string` | FK → Account. `null` until resolved |
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
| `authorId` | `string` | FK → Account (Assignee) |
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
| `reviewerId` | `string` | FK → Account |
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
| `mergedById` | `string` | FK → Account (Maintainer) |
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
| `uploadedById` | `string` | FK → Account |
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
| `uploadedById` | `string` | FK → Account |
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
| `assigneeId` | `string` | FK → Account |
| `scheduledStart` | `timestamp` | |
| `scheduledEnd` | `timestamp` | |
| `approvedById` | `string` | FK → Account (OrgOwner) |
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
| `orgId` | `string` | FK → Account (accountType=organization) |
| `triggerEvent` | `string` | Always `task_accepted` |
| `triggeredAt` | `timestamp` | |

---

### ARRecord / 應收帳款記錄

Represents money owed to the organization by a client.

| Field | Type | Notes |
|-------|------|-------|
| `arId` | `string` | UUID — primary key |
| `settlementId` | `string` | FK → SettlementRecord |
| `orgId` | `string` | FK → Account (accountType=organization) |
| `clientId` | `string` | FK → Account or external client ref |
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
| `assigneeId` | `string` | FK → Account |
| `amount` | `number` | |
| `currency` | `string` | ISO 4217 |
| `state` | `string` | `pending \| scheduled \| paid` |
| `scheduledAt` | `timestamp` | Payment scheduled date |
| `paidAt` | `timestamp` | `null` until paid |
