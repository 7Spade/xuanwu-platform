# Business Entities / 核心業務實體

Canonical definitions of every first-class domain object in the system.
Entity definitions reflect the actual implementation in `src/modules/`.
Each entity maps to a Firestore collection within its bounded context.

> **SSOT reference**: Entity ownership and module boundaries are defined in
> [`docs/architecture/notes/model-driven-hexagonal-architecture.md`](../notes/model-driven-hexagonal-architecture.md).
> `account.module` is the authoritative bounded context for all Account aggregates.
> `identity.module` owns auth credentials and sessions — it does **not** own Account data.

---

## Entity Overview / 實體總覽

```
SaaS Layer
├── IdentityRecord (identity.module)
├── AccountEntity (account.module)
│   ├── AccountProfile
│   ├── MembershipRecord
│   └── TeamRecord
├── NamespaceEntity (namespace.module)
│   └── WorkspaceBinding
├── SettlementRecord (settlement.module)
│   └── ClaimLineItem
├── NotificationRecord (notification.module)
├── SocialRelation (social.module)
├── AchievementRecord (achievement.module)
├── SearchIndexEntry / SearchResult (search.module)
└── AuditEntry (audit.module)

Workspace Layer
├── WorkspaceEntity (workspace.module / domain.workspace)
│   ├── WorkspaceGrant
│   ├── WorkspaceTask (WBS)
│   ├── WorkspaceLocation
│   └── WorkspacePersonnel
├── IssueEntity (workspace.module / domain.issues)
├── DailyLogEntity (workspace.module / domain.daily)
├── FileEntity (file.module)
│   └── FileVersion
├── WorkItemEntity (work.module)
│   ├── MilestoneEntity
│   └── WorkDependency
└── ForkEntity (fork.module)

Bridge Layer
└── ScheduleAssignment (workforce.module)
    └── ScheduleLocation

Cross-cutting
├── Comment (collaboration.module)
└── CausalNode / CausalEdge / CausalPath (causal-graph.module)

Scaffold (implementation pending)
├── governance.module
├── knowledge.module
├── subscription.module
├── taxonomy.module
└── vector-ingestion.module
```

---

## SaaS Layer Entities / SaaS 層實體

---

### IdentityRecord

**Module**: `identity.module` · `domain.identity/_entity.ts`

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID — primary key |
| `provider` | `string` | Auth provider (`google \| github \| email`) |
| `providerUid` | `string` | UID issued by the identity provider |
| `accountId` | `string` | FK → AccountEntity |
| `email` | `string` | Verified email address |
| `isAnonymous` | `boolean` | `true` for anonymous sessions |
| `claims` | `Record<string, unknown>` | Custom Firebase JWT claims |

**Key invariants**
- An IdentityRecord maps exactly one provider credential to one AccountEntity.
- `identity.module` does NOT own Account-level data — it only owns auth credentials.
- Anonymous IdentityRecords are promoted upon sign-in completion.

**Key relationships**
- `N IdentityRecord → 1 AccountEntity` (multiple providers per account are supported)

---

### AccountEntity

**Module**: `account.module` · `domain.account/_entity.ts`

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID — primary key |
| `handle` | `string` | Globally unique URL-safe handle |
| `accountType` | `string` | `personal \| org` |
| `profile` | `AccountProfile` | Embedded profile sub-aggregate |
| `ownerId` | `string` | For org accounts: founding AccountEntity id |
| `members` | `MembershipRecord[]` | Membership list — org accounts only |
| `teams` | `TeamRecord[]` | Teams owned by this account — org accounts only |

**Key invariants**
- A `personal` account has no `members` or `teams`.
- An `org` account must have at least one member with the `owner` role.
- `handle` is globally unique and immutable once registered.
- Deleting an org account requires all Workspaces to be archived first.

**Key relationships**
- `1 AccountEntity → 1 NamespaceEntity`
- `1 AccountEntity (org) → N MembershipRecord`
- `1 AccountEntity (org) → N TeamRecord`

#### AccountProfile

| Field | Type | Notes |
|-------|------|-------|
| `displayName` | `string` | Public display name |
| `avatarUrl` | `string` | Profile image URL |
| `bio` | `string` | Optional |

#### MembershipRecord

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID |
| `accountId` | `string` | FK → AccountEntity (member) |
| `role` | `string` | `owner \| admin \| member` |
| `joinedAt` | `timestamp` | |

#### TeamRecord

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID |
| `name` | `string` | Team display name |
| `slug` | `string` | URL-safe, unique within org |
| `memberAccountIds` | `string[]` | FK → AccountEntity[] |

---

### NamespaceEntity

**Module**: `namespace.module` · `domain.namespace/_entity.ts`

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID — primary key |
| `slug` | `string` | Globally unique URL path prefix |
| `ownerType` | `string` | `personal \| org` |
| `ownerId` | `string` | FK → AccountEntity |
| `workspaces` | `WorkspaceBinding[]` | Workspace references scoped to this namespace |

**Key invariants**
- Slug is globally unique and immutable once registered.
- Workspace full path is `{namespace-slug}/{workspace-slug}`.
- A `personal` AccountEntity has exactly one personal Namespace.
- An `org` AccountEntity has exactly one org Namespace.

#### WorkspaceBinding

| Field | Type | Notes |
|-------|------|-------|
| `workspaceId` | `string` | FK → WorkspaceEntity |
| `slug` | `string` | Workspace slug within this namespace |

---

### SettlementRecord

**Module**: `settlement.module` · `domain.settlement/_entity.ts`

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID — primary key |
| `workspaceId` | `string` | FK → WorkspaceEntity |
| `dimensionId` | `string` | Business dimension / unit ID |
| `role` | `string` | `AR \| AP` (accounts receivable / payable) |
| `stage` | `FinanceLifecycleStage` | Current billing lifecycle stage |
| `cycleIndex` | `number` | Billing cycle number |
| `contractAmount` | `number` | Total contracted value |
| `receivedAmount` | `number` | Amount received to date |
| `currentClaimLineItems` | `ClaimLineItem[]` | Line items for the current billing cycle |
| `paymentTermStartAt` | `timestamp` | Payment term start date |
| `paymentReceivedAt` | `timestamp \| null` | Actual payment receipt date |

**Key invariants**
- `role = AR` tracks money owed to the org; `role = AP` tracks money owed to assignees.
- Settlement stage follows the `FinanceLifecycleStage` state machine.

#### ClaimLineItem

| Field | Type | Notes |
|-------|------|-------|
| `workItemId` | `string` | FK → WorkItemEntity |
| `description` | `string` | Line item description |
| `quantity` | `number` | Work unit quantity |
| `unitPrice` | `number` | Unit price |
| `amount` | `number` | Computed: `quantity × unitPrice` |

---

### NotificationRecord

**Module**: `notification.module` · `domain.notification/_entity.ts`

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID — primary key |
| `recipientAccountId` | `string` | FK → AccountEntity |
| `channel` | `string` | `in-app \| email \| push` |
| `priority` | `string` | `low \| normal \| high \| urgent` |
| `title` | `string` | Notification title |
| `body` | `string` | Notification body |
| `sourceEventKey` | `string` | Originating domain event key |
| `read` | `boolean` | Whether the notification has been read |
| `readAt` | `timestamp \| null` | When the notification was read |

**Key relationships**
- Each record belongs to exactly one recipient AccountEntity.
- `sourceEventKey` links back to the domain event that triggered the notification.

---

### SocialRelation

**Module**: `social.module` · `domain.social/_entity.ts`

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID — primary key |
| `subjectAccountId` | `string` | FK → AccountEntity (actor) |
| `targetId` | `string` | FK → target entity |
| `targetType` | `string` | `account \| workspace \| work-item` |
| `relationType` | `string` | `star \| watch \| follow` |

**Key invariants**
- The `(subjectAccountId, targetId, relationType)` tuple is unique.

---

### AchievementRecord

**Module**: `achievement.module` · `domain.achievement/_entity.ts`

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID — primary key |
| `accountId` | `string` | FK → AccountEntity |
| `badgeSlug` | `string` | Identifies the badge rule |
| `unlockedAt` | `timestamp` | When the badge was earned |

**Key invariants**
- Each `(accountId, badgeSlug)` pair is unique — a badge is unlocked at most once per account.
- Badge projection writes to `account.module` via `IAccountBadgeWritePort` (ACL port).

---

### SearchIndexEntry / SearchResult

**Module**: `search.module` · `domain.search/_entity.ts`

#### SearchIndexEntry

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID — primary key |
| `sourceModule` | `string` | Name of the originating module |
| `sourceId` | `string` | FK → source entity in originating module |
| `ownerAccountId` | `string` | FK → AccountEntity |
| `workspaceId` | `string \| null` | FK → WorkspaceEntity (`null` for SaaS-level entries) |
| `visibility` | `string` | `public \| private` |
| `title` | `string` | Indexed title |
| `snippet` | `string` | Indexed preview snippet |
| `tags` | `string[]` | Searchable tag set |
| `indexedAt` | `timestamp` | Last index timestamp |

#### SearchResult

| Field | Type | Notes |
|-------|------|-------|
| `sourceModule` | `string` | Originating module name |
| `sourceId` | `string` | FK → source entity |
| `title` | `string` | |
| `snippet` | `string` | |
| `score` | `number` | Relevance score `0.0–1.0` |

---

### AuditEntry

**Module**: `audit.module` · `domain.audit/_entity.ts`

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID — primary key |
| `actor` | `ActorRef` | Who performed the action (embedded snapshot) |
| `action` | `AuditAction` | The action type |
| `resource` | `ResourceRef` | The affected resource (embedded snapshot) |
| `metadata` | `Record<string, unknown>` | Additional context data |
| `originEventId` | `string` | Source domain event ID |
| `outcome` | `string` | `pass \| fail \| blocked` |
| `occurredAt` | `timestamp` | When the action occurred |

**Key invariants**
- Append-only — never updated or deleted.
- `actor` and `resource` are embedded snapshots, not FK references, to preserve historical accuracy.

---

## Workspace Layer Entities / Workspace 層實體

---

### WorkspaceEntity

**Module**: `workspace.module / domain.workspace` · `domain.workspace/_entity.ts`

> `workspace.module` owns three domain aggregates: `domain.workspace`, `domain.issues`, and `domain.daily`.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID — primary key |
| `dimensionId` | `string` | Business dimension / unit ID |
| `namespaceId` | `string` | FK → NamespaceEntity |
| `slug` | `string` | Unique within namespace |
| `name` | `string` | Display name |
| `lifecycleState` | `string` | Workspace lifecycle status |
| `visibility` | `string` | `public \| private` |
| `scope` | `string` | Workspace scope descriptor |
| `protocol` | `string` | Workflow protocol identifier |
| `grants` | `WorkspaceGrant[]` | Per-account access grants |
| `teamIds` | `string[]` | FK → TeamRecord[] |
| `personnel` | `WorkspacePersonnel` | Personnel configuration |
| `address` | `string` | Physical address (if applicable) |
| `locations` | `WorkspaceLocation[]` | Geo-tagged work locations |
| `capabilities` | `string[]` | Enabled capability flags |
| `tasks` | `Record<string, WorkspaceTask>` | WBS task map keyed by task ID |

> **Terminology note**: `WorkspaceGrant` currently stores `userId` in the code-level field. This is a known terminology inconsistency documented in ADR-014. Do not rename the code field until a dedicated migration PR is raised.

**Key invariants**
- A Workspace must belong to a Namespace.
- Full path is `{namespace-slug}/{workspace-slug}`.
- Archiving a Workspace freezes all mutation operations.

#### WorkspaceGrant

| Field | Type | Notes |
|-------|------|-------|
| `accountId` | `string` | FK → AccountEntity (code field: `userId` — see ADR-014) |
| `role` | `string` | `maintainer \| collaborator` |
| `grantedAt` | `timestamp` | |

#### WorkspaceTask (WBS)

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | Task ID within workspace |
| `title` | `string` | |
| `status` | `string` | Task lifecycle status |
| `parentId` | `string \| null` | Parent task ID (WBS hierarchy) |
| `assigneeIds` | `string[]` | FK → AccountEntity[] |

#### WorkspaceLocation

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | Location ID |
| `label` | `string` | Display label |
| `coordinates` | `GeoPoint` | Latitude / longitude |

#### WorkspacePersonnel

| Field | Type | Notes |
|-------|------|-------|
| `supervisorId` | `string` | FK → AccountEntity |
| `coordinatorIds` | `string[]` | FK → AccountEntity[] |

---

### IssueEntity

**Module**: `workspace.module / domain.issues` · `domain.issues/_entity.ts`

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID — primary key |
| `workspaceId` | `string` | FK → WorkspaceEntity |
| `title` | `string` | |
| `description` | `string` | |
| `status` | `string` | `open \| resolved` |
| `severity` | `string` | Issue severity level |
| `reporterId` | `string` | FK → AccountEntity (reporter) |
| `assigneeId` | `string \| null` | FK → AccountEntity (assignee) |
| `resolvedAt` | `timestamp \| null` | |

**Key invariants**
- An open Issue on a WorkspaceTask can block the task's state progression.
- Resolving the last open Issue on a task resumes its progression.

---

### DailyLogEntity

**Module**: `workspace.module / domain.daily` · `domain.daily/_entity.ts`

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID — primary key |
| `workspaceId` | `string` | FK → WorkspaceEntity |
| `date` | `string` | ISO date string (`YYYY-MM-DD`) |
| `content` | `string` | Log body text |
| `photoURLs` | `string[]` | Attached photo URLs |
| `authorId` | `string` | FK → AccountEntity |

**Key invariants**
- One log entry per author per date per workspace.

---

### FileEntity

**Module**: `file.module` · `domain.file/_entity.ts`

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID — primary key |
| `workspaceId` | `string` | FK → WorkspaceEntity |
| `name` | `string` | Original filename |
| `mimeType` | `string` | MIME type |
| `currentVersionId` | `string` | FK → FileVersion (latest active version) |
| `versions` | `FileVersion[]` | All versions — append-only |
| `parseStatus` | `string` | `pending \| completed \| failed` |

**Key invariants**
- A new upload creates a new FileVersion and updates `currentVersionId`.
- FileVersions are append-only — never deleted.

#### FileVersion

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID — version primary key |
| `fileId` | `string` | FK → FileEntity |
| `storageUri` | `string` | Firebase Storage path |
| `sizeBytes` | `number` | File size in bytes |
| `uploadedById` | `string` | FK → AccountEntity |
| `createdAt` | `timestamp` | |

---

### WorkItemEntity

**Module**: `work.module` · `domain.work/_entity.ts`

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID — primary key |
| `workspaceId` | `string` | FK → WorkspaceEntity |
| `title` | `string` | |
| `status` | `string` | Work item lifecycle status |
| `priority` | `string` | `low \| medium \| high \| critical` |
| `milestoneId` | `string \| null` | FK → MilestoneEntity |
| `assigneeId` | `string \| null` | FK → AccountEntity |
| `dueDate` | `timestamp \| null` | |
| `dependencies` | `WorkDependency[]` | Upstream dependency list |
| `parentId` | `string \| null` | FK → WorkItemEntity (task hierarchy) |
| `type` | `string` | Work item type classifier |
| `quantity` | `number` | Work unit quantity |
| `unitPrice` | `number` | Unit price for settlement |
| `subtotal` | `number` | Derived: `quantity × unitPrice` |
| `location` | `string \| null` | Physical location tag |
| `photoURLs` | `string[]` | Attached photo references |

**Key invariants**
- `subtotal` is always derived — `quantity × unitPrice`.
- A WorkItemEntity with unresolved upstream dependencies is blocked from state progression.

#### MilestoneEntity

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID — primary key |
| `workspaceId` | `string` | FK → WorkspaceEntity |
| `name` | `string` | Milestone name |
| `targetDate` | `timestamp` | Target completion date |
| `workItemIds` | `string[]` | FK → WorkItemEntity[] |

#### WorkDependency

| Field | Type | Notes |
|-------|------|-------|
| `upstreamId` | `string` | FK → WorkItemEntity (must complete first) |
| `type` | `string` | `finish-to-start \| start-to-start` |

---

### ForkEntity

**Module**: `fork.module` · `domain.fork/_entity.ts`

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID — primary key |
| `originWorkspaceId` | `string` | FK → WorkspaceEntity (source workspace) |
| `forkedByAccountId` | `string` | FK → AccountEntity |
| `baselineVersion` | `string` | Baseline snapshot reference |
| `status` | `string` | `active \| merged \| abandoned` |
| `pendingCRId` | `string \| null` | FK → pending change request |

**Key invariants**
- A Fork is always created from a specific baseline version.
- Merging a Fork requires an approved change request.

---

## Bridge Layer Entities / 橋接層實體

---

### ScheduleAssignment

**Module**: `workforce.module` · `domain.workforce/_entity.ts`

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID — primary key |
| `accountId` | `string` | FK → AccountEntity (requester / org) |
| `workspaceId` | `string` | FK → WorkspaceEntity |
| `title` | `string` | Assignment title |
| `status` | `string` | `PROPOSAL \| OFFICIAL \| COMPLETED \| CANCELLED` |
| `originType` | `string` | How the assignment originated |
| `assigneeIds` | `string[]` | FK → AccountEntity[] (assignees) |
| `location` | `ScheduleLocation` | Work location |
| `requiredSkills` | `string[]` | Skill tags for workforce matching |
| `startDate` | `timestamp` | Scheduled start date |
| `endDate` | `timestamp` | Scheduled end date |
| `version` | `number` | Optimistic concurrency version counter |

**Key invariants**
- A `PROPOSAL` assignment must be promoted to `OFFICIAL` before work begins.
- `assigneeIds` may only contain AccountEntities that are workspace members.
- This entity bridges SaaS identity data with Workspace-level execution — it is the sole Bridge Layer entity.

#### ScheduleLocation

| Field | Type | Notes |
|-------|------|-------|
| `label` | `string` | Location display label |
| `address` | `string` | Physical address |
| `coordinates` | `GeoPoint \| null` | Optional geo-coordinates |

---

## Cross-cutting Entities / 跨切面實體

---

### Comment

**Module**: `collaboration.module` · `domain.collaboration/_entity.ts`

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID — primary key |
| `workspaceId` | `string` | FK → WorkspaceEntity |
| `artifactType` | `string` | Type of the commented artifact |
| `artifactId` | `string` | FK → artifact entity |
| `authorAccountId` | `string` | FK → AccountEntity |
| `body` | `string` | Comment body (Markdown) |
| `parentId` | `string \| null` | FK → Comment (threaded replies) |
| `editedAt` | `timestamp \| null` | Last edit timestamp |
| `deletedAt` | `timestamp \| null` | Soft-delete timestamp |

**Key invariants**
- Comments are soft-deleted: `deletedAt` is set and content is cleared, but the record is retained.
- `artifactType` identifies which module owns the commented artifact.

---

### CausalNode / CausalEdge / CausalPath

**Module**: `causal-graph.module` · `domain.causal-graph/_entity.ts`

#### CausalNode

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID — primary key |
| `kind` | `string` | `work-item \| milestone \| cr \| qa \| baseline \| domain-event \| settlement \| audit-entry` |
| `sourceRef` | `string` | FK → source entity in originating module |
| `label` | `string` | Display label |
| `occurredAt` | `timestamp` | When the causal event occurred |

#### CausalEdge

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID — primary key |
| `causeNodeId` | `string` | FK → CausalNode (cause) |
| `effectNodeId` | `string` | FK → CausalNode (effect) |
| `confidence` | `number` | Causality confidence score `0.0–1.0` |
| `reason` | `string` | Human-readable rationale |

#### CausalPath

A traversed sequence of `CausalNode` and `CausalEdge` representing a complete cause-effect chain.

**Key invariants**
- CausalNodes are append-only — causal history is never rewritten.
- CausalEdges encode inferred causality with an explicit confidence score.

---

## Scaffold Modules / 待實作模組

The following modules exist as directory scaffolds in `src/modules/` but have no entity implementations yet.
They are documented here for planning purposes. See ADR-014.

| Module | Layer | Planned Responsibility |
|--------|-------|------------------------|
| `governance.module` | SaaS | Governance rules, policy enforcement, compliance workflows |
| `knowledge.module` | Workspace | Knowledge base, document library, wiki pages |
| `subscription.module` | SaaS | Subscription plans, feature entitlements, billing cycles |
| `taxonomy.module` | SaaS (cross-cutting) | Tag taxonomy, label hierarchy, classification trees |
| `vector-ingestion.module` | SaaS (cross-cutting) | Vector embedding pipeline for semantic search integration |
