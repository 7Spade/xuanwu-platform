# Event Catalog / 事件目錄

Canonical registry of all domain events published to the Event Bus.
Each event defines its producer, payload schema, consumer subscriptions, and notification rules.

---

## Event Naming Convention / 事件命名規範

```
{domain}.{entity}.{verb}

domain  →  saas | workspace | wbs | issue | cr | file | intel | workforce | settlement
entity  →  singular noun matching the business entity
verb    →  past tense: created | updated | deleted | state_changed | approved | merged | etc.

Examples:
  wbs.task.state_changed
  cr.review.approved
  file.version.uploaded
  settlement.ar_record.issued
```

---

## Event Envelope / 事件信封結構

Every event published to the Event Bus shares this envelope:

```typescript
interface EventEnvelope {
  eventId:     string       // UUID — unique per event
  eventType:   string       // e.g. "wbs.task.state_changed"
  version:     string       // Schema version e.g. "1.0"
  occurredAt:  timestamp    // When the domain action happened
  publishedAt: timestamp    // When the event was written to the bus
  source: {
    service:     string     // Emitting service e.g. "wbs-module"
    workspaceId: string     // null for SaaS-layer events
    orgId:       string     // null for personal workspace events
  }
  actorId:     string       // userId who triggered the action
  payload:     object       // Event-specific fields (see below)
}
```

---

## SaaS Layer Events / SaaS 層事件

### `saas.org.created`

| Field | Value |
|-------|-------|
| **Producer** | Organization service |
| **Trigger** | User creates an organization |
| **Consumers** | Namespace service, Notification Engine |

**Payload**
```typescript
{ orgId: string; ownerId: string; displayName: string; namespaceId: string }
```

---

### `saas.workspace.created`

| Field | Value |
|-------|-------|
| **Producer** | Workspace service |
| **Trigger** | OrgOwner or User creates a workspace |
| **Consumers** | Notification Engine, Discovery Feed |

**Payload**
```typescript
{ workspaceId: string; orgId: string; ownerId: string; displayName: string; visibility: "public" | "private" }
```

**Notification rules**
- Notify OrgOwner: `workspace created under your organization`
- If `visibility = public`: contribute to Discovery Feed ranking

---

### `saas.team.member_added`

**Payload**
```typescript
{ teamId: string; userId: string; role: "member" | "lead"; addedById: string }
```

**Notification rules**
- Notify `userId`: `You have been added to team {teamName}`

---

### `saas.workspace.member_invited`

**Payload**
```typescript
{ workspaceId: string; inviteeId: string; invitedById: string; role: "maintainer" | "collaborator" }
```

**Notification rules**
- Notify `inviteeId`: `You have been invited to collaborate on {workspaceName}` — action required

---

### `saas.workspace.member_accepted`

**Payload**
```typescript
{ workspaceId: string; userId: string; role: "maintainer" | "collaborator" }
```

**Notification rules**
- Notify workspace owner: `{userName} accepted invitation to {workspaceName}`

---

## Workforce Events / 人力排程事件

### `workforce.request.submitted`

**Payload**
```typescript
{ requestId: string; taskId: string; workspaceId: string; skillRequirement: string[]; preferredStart: timestamp; preferredEnd: timestamp; effortHours: number }
```

**Notification rules**
- Notify OrgOwner: `New workforce request requires your approval for task {taskTitle}`

---

### `workforce.schedule.approved`

**Payload**
```typescript
{ scheduleId: string; taskId: string; assigneeId: string; scheduledStart: timestamp; scheduledEnd: timestamp; approvedById: string }
```

**Notification rules**
- Notify `assigneeId`: `You have been assigned task {taskTitle} — scheduled {start} to {end}`

---

## WBS Task Events / WBS 任務事件

### `wbs.task.created`

**Payload**
```typescript
{ taskId: string; workspaceId: string; title: string; createdById: string; epicId: string }
```

---

### `wbs.task.state_changed`

**Payload**
```typescript
{ taskId: string; workspaceId: string; fromState: string; toState: string; actorId: string; reason: string }
```

**Notification rules**

| Transition | Notify | Message |
|------------|--------|---------|
| `pending` → `in_progress` | Maintainer | `Task {title} started by {assignee}` |
| `in_progress` → `blocked` | Maintainer, Assignee | `Task {title} is blocked — issue opened` |
| `blocked` → `in_progress` | Assignee | `Task {title} unblocked — issue resolved` |
| `done` → `qa_in_review` | QA Reviewer | `Task {title} ready for QA review` |
| `qa_in_review` → `in_progress` | Assignee | `Task {title} failed QA — rework required` |
| `qa_in_review` → `acceptance_review` | Stakeholder / Maintainer | `Task {title} passed QA — pending acceptance` |
| `acceptance_review` → `in_progress` | Assignee | `Task {title} rejected at acceptance — rework required` |
| `acceptance_review` → `accepted` | Assignee, OrgOwner | `Task {title} accepted — settlement triggered` |

**Special consumer rules**
- On `accepted`: trigger Settlement Layer → `settlement.record.created`
- On `accepted`: evaluate Achievement Rules → may emit `achievement.badge.unlocked`

---

### `wbs.task.assignee_changed`

**Payload**
```typescript
{ taskId: string; workspaceId: string; previousAssigneeId: string; newAssigneeId: string }
```

---

## Issue Events / 議題事件

### `issue.created`

**Payload**
```typescript
{ issueId: string; workspaceId: string; sequentialNumber: number; linkedTaskId: string; title: string; openedById: string }
```

**Consumers** — WBS Module (→ transitions task to `blocked`), Notification Engine

---

### `issue.resolved`

**Payload**
```typescript
{ issueId: string; workspaceId: string; sequentialNumber: number; linkedTaskId: string; resolvedById: string; remainingOpenCount: number }
```

- If `remainingOpenCount = 0`: notify Assignee `Task {title} unblocked`

---

## Change Request Events / 變更請求事件

### `cr.created`

**Payload**
```typescript
{ crId: string; workspaceId: string; taskId: string; authorId: string; snapshotRef: string }
```

---

### `cr.review.submitted`

**Payload**
```typescript
{ crId: string; reviewId: string; reviewerId: string; decision: "approved" | "changes_requested"; comment: string }
```

---

### `cr.merged`

**Payload**
```typescript
{ crId: string; workspaceId: string; taskId: string; mergedById: string; snapshotRef: string; viaQueue: boolean; queueId: string }
```

**Notification rules**
- Notify CR author: `Your change request has been merged into the baseline`
- Notify workspace watchers: `Baseline updated — {crTitle} merged`

---

### `cr.merge_queue.group_failed`

**Payload**
```typescript
{ queueId: string; workspaceId: string; failedCrIds: string[]; reason: string }
```

---

## File Events / 檔案事件

### `file.version.uploaded`

**Payload**
```typescript
{ fileId: string; versionId: string; workspaceId: string; uploadedById: string; name: string; mimeType: string; sizeBytes: number; isParseable: boolean }
```

- If `isParseable = true`: trigger Intelligence Pipeline silently

---

## Intelligence Layer Events / 智能層事件

### `intel.parsing.completed`

**Payload**
```typescript
{ parseId: string; fileId: string; fileVersionId: string; workspaceId: string; state: "completed" | "failed"; errorMessage: string }
```

---

### `intel.extraction.completed`

**Payload**
```typescript
{ parseId: string; fileId: string; workspaceId: string; extractedCount: number; linkedTaskIds: string[]; linkedWorkItemIds: string[] }
```

**Notification rules**
- Notify workspace Maintainer: `{n} objects extracted from {filename} and linked to {m} tasks`

---

## Settlement Events / 結算事件

### `settlement.record.created`

**Payload**
```typescript
{ settlementId: string; taskId: string; workspaceId: string; orgId: string; triggeredAt: timestamp }
```

---

### `settlement.ar_record.issued`

**Payload**
```typescript
{ arId: string; settlementId: string; orgId: string; clientId: string; invoiceRef: string; amount: number; currency: string }
```

---

### `settlement.ap_record.scheduled`

**Payload**
```typescript
{ apId: string; settlementId: string; assigneeId: string; amount: number; currency: string; scheduledAt: timestamp }
```

---

## Achievement Events / 成就事件

### `achievement.badge.unlocked`

**Payload**
```typescript
{ userId: string; badgeId: string; badgeName: string; ruleId: string; unlockedAt: timestamp }
```

- Update UserProfile `badges` array

---

## Notification Subscription Rules Summary / 通知訂閱規則總覽

| Trigger Pattern | Resolution Method | Recipient(s) |
|----------------|-------------------|--------------|
| Direct participant | `actorId` match | The user who performed the action |
| Task assignee | `task.assigneeId` lookup | Current assignee of the task |
| Workspace maintainer | `WorkspaceMember.role = maintainer` | All maintainers of the workspace |
| Reviewer | `CRReview.reviewerId` | Users who reviewed the CR |
| `@mention` in CR | Parse CR description for `@{userId}` or `@{teamSlug}` | Mentioned user or all team members |
| Watch subscription | `Social.watch` records for `workspaceId` | All users watching the workspace |
| Follow subscription | `Social.follow` records for `userId` | All users following the actor |
| OrgOwner | `Organization.ownerId` | Org owner(s) |
| Custom rule | User-defined subscription filter | Per-user configuration |
