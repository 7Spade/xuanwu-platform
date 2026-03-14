# Xuanwu Platform — Progressive Value Extraction Backlog

> Created: 2026-03-14 by comprehensive source analysis of `7Spade/xuanwu` via repomix skill output.
> Source: `.github/skills/xuanwu-skill/references/files.md` (600 files, 10,696 lines)
> Purpose: Master task list so future waves can execute directly without re-reading source.

---

## Source → Target Mapping

| Source slice (7Spade/xuanwu) | Target module (xuanwu-platform) | Status |
|------------------------------|----------------------------------|--------|
| `identity.slice` | `identity.module` | ✅ Wave 9 |
| `account.slice` | `account.module` | ✅ Wave 9 |
| `workspace.slice` (core/WBS/access) | `workspace.module` | ✅ Wave 10 |
| `workforce-scheduling.slice` | `workforce.module` | ✅ Wave 10 |
| `workspace.slice` (tasks/issues) | `work.module` | ✅ Wave 11 |
| `notification-hub.slice` | `notification.module` | ✅ Wave 11 |
| `finance.slice` | `settlement.module` | ✅ Wave 12 |
| `skill-xp.slice` | `achievement.module` | ✅ Wave 12 |
| `organization.slice` (namespaces) | `namespace.module` | ✅ Wave 13 |
| `social-graph.slice` | `social.module` | ✅ Wave 13 |
| `workspace.slice/domain.files` | `file.module` | ✅ Wave 14 |
| `organization.slice/gov.*` | `audit.module` | ✅ Wave 14 |
| `workspace.slice` (fork/divergence) | `fork.module` | ✅ Wave 15 |
| `workspace.slice` (comments/reactions) | `collaboration.module` | ✅ Wave 15 |
| `global-search.slice` + `semantic-graph.slice` | `search.module` | ✅ Wave 16 |
| `semantic-graph.slice` (BFS/DFS causal) | `causal-graph.module` | ✅ Wave 16 |
| `workspace.slice/domain.tasks` (advanced tree WBS) | `work.module` + `workspace.module` | ⬜ Wave 43 |
| `workspace.slice/core` (create-workspace-dialog) | `workspace.module` | ⬜ Wave 44 |
| `workspace.slice/domain.daily` | `workspace.module` | ⬜ Wave 45 |
| `workspace.slice/domain.issues` | `workspace.module` | ⬜ Wave 46 |

### Parity Status (Waves 30–42 complete)

| Wave | Scope | Status |
|------|-------|--------|
| 30 | Audit presentation | ✅ |
| 31 | WorkspaceShell + nav tabs | ✅ |
| 32 | Capabilities domain model + view | ✅ |
| 33 | StatusBar + dynamic tabs + grants | ✅ |
| 34 | Settings write-path + mount/unmount | ✅ |
| 35 | Access-control write-path (grant/revoke/role) | ✅ |
| 36 | Delete workspace | ✅ |
| 37 | WorkspaceCard lifecycle advance + gear | ✅ |
| 38 | WBS create work item | ✅ |
| 39 | Work item inline edit | ✅ |
| 40 | Workspace photo URL | ✅ |
| 41 | Work item delete + description display | ✅ |
| 42 | Workspace sub-locations panel | ✅ |
| **43** | **Advanced WBS task tree engine** | **⬜ NEXT** |
| 44 | Create Workspace dialog | ⬜ |
| 45 | Daily Log View (capability-gated) | ⬜ |
| 46 | Issues View (capability-gated) | ⬜ |

---

## Wave 14 — file.module + audit.module

### file.module

**Source:** `src/features/workspace.slice/domain.files/`

**domain.file/_service.ts**
- `MIME_GROUPS` — `Record<string, MimeGroup>` mapping mime prefixes to `'image'|'document'|'code'|'data'|'other'`
- `getMimeGroup(mimeType: string): MimeGroup` — classify file mime type
- `getCurrentVersion(file: FileEntity): FileVersion | undefined` — returns the version matching `currentVersionId`
- `resolveCanonicalVersion(versions: readonly FileVersion[]): FileVersion` — highest `versionNumber`
- `isVersionStale(version: FileVersion, file: FileEntity): boolean` — version is not the current one
- `detectVersionConflict(a: FileVersion, b: FileVersion): boolean` — same versionNumber, different versionId (concurrent upload collision)
- `getVersionByNumber(file: FileEntity, n: number): FileVersion | undefined`
- `buildFileVersion(id: FileVersionId, versionNumber: number, name: string, size: number, uploadedBy: string, downloadURL: string, now: string, storagePath?: string): FileVersion`

**infra.firestore/_mapper.ts**
- `FileVersionDoc` interface
- `FileEntityDoc` interface
- `fileVersionDocToVO(doc): FileVersion`
- `fileEntityDocToEntity(doc): FileEntity`
- `fileEntityToDoc(entity): FileEntityDoc`

**infra.firestore/_repository.ts**
- `WORKSPACE_FILES_COLLECTION = "workspace-files"` — collection name pattern: `workspaces/{wid}/files`
- `FirestoreFileRepository implements IFileRepository`
  - `findById(id)` — reads from `workspaces/{wid}/files/{id}` — NOTE: needs workspaceId, use flat collection with workspaceId field for simplicity
  - `findByWorkspaceId(workspaceId)`
  - `save(file)` — setDoc
  - `deleteById(id)` — deleteDoc

### audit.module

**Source:** `src/features/organization.slice/gov.*` + domain model already in repository

**domain.audit/_service.ts**
- `AUDITABLE_ACTIONS: ReadonlySet<AuditAction>` — set of all AuditAction enum values
- `isActionAuditable(action: string): action is AuditAction`
- `filterByResource(entries: AuditEntry[], resourceType: string, resourceId?: string): AuditEntry[]`
- `filterByActor(entries: AuditEntry[], actorId: string): AuditEntry[]`
- `groupByAction(entries: AuditEntry[]): Record<AuditAction, AuditEntry[]>`
- `groupByResourceType(entries: AuditEntry[]): Record<string, AuditEntry[]>`
- `computeComplianceRate(entries: AuditEntry[], predicate: (e: AuditEntry) => boolean): number` — 0–1 ratio
- `summarizeByResourceType(entries: AuditEntry[]): Record<string, number>` — count per type
- `sortByOccurredAt(entries: AuditEntry[], order?: 'asc'|'desc'): AuditEntry[]`

**infra.firestore/_mapper.ts**
- `ActorRefDoc`, `ResourceRefDoc` sub-document interfaces
- `AuditEntryDoc` interface
- `auditEntryDocToEntity(doc): AuditEntry`
- `auditEntryToDoc(entry): AuditEntryDoc`

**infra.firestore/_repository.ts**
- `AUDIT_ENTRIES_COLLECTION = "audit-entries"` (flat collection)
- `FirestoreAuditRepository implements IAuditRepository`
  - `append(entry)` — setDoc (never updateDoc — append-only invariant)
  - `findById(id)` — getDoc
  - `findByResourceId(resourceId, limit?)` — query with `where("resource.resourceId", "==", resourceId)`
  - `findByActorId(actorId, limit?)` — query with `where("actor.accountId", "==", actorId)`
  - `findByWorkspaceId(workspaceId, limit?)` — query with `where("resource.workspaceId", "==", workspaceId)`

---

## Wave 15 — fork.module + collaboration.module

### fork.module

**Source:** `src/features/workspace.slice` (fork patterns) + domain model in repository

**domain.fork/_service.ts**
- `VALID_FORK_TRANSITIONS: Record<ForkStatus, ForkStatus[]>` — FSM: `active→merging, active→abandoned, merging→merged, merging→active`
- `canTransitionForkStatus(current: ForkStatus, next: ForkStatus): boolean`
- `hasPendingCR(fork: ForkEntity): boolean` — `!!fork.pendingCRId`
- `isMergeBackEligible(fork: ForkEntity): boolean` — status=active, no pendingCR
- `computeDivergenceCount(forkedItems: readonly string[], originItems: readonly string[]): number` — items in fork not in origin
- `buildForkDivergenceSummary(added: number, modified: number, removed: number): string` — human-readable summary

**infra.firestore/_mapper.ts**
- `ForkDoc` interface
- `forkDocToEntity(doc): ForkEntity`
- `forkEntityToDoc(entity): ForkDoc`

**infra.firestore/_repository.ts**
- `FORKS_COLLECTION = "forks"`
- `FirestoreForkRepository implements IForkRepository`

### collaboration.module

**Source:** `src/features/workspace.slice` (comment/reaction/mention/presence patterns)

**domain.collaboration/_service.ts**
- `MENTION_PATTERN: RegExp` — `/@([a-zA-Z0-9_-]+)/g`
- `extractMentionedHandles(body: string): string[]` — unique @handles extracted from comment body
- `buildReplyTree(comments: Comment[]): CommentNode[]` — nest replies by parentId; `CommentNode = Comment & { replies: CommentNode[] }`
- `isEditableByAuthor(comment: Comment, accountId: string): boolean` — `comment.authorAccountId === accountId && !comment.deletedAt`
- `isSoftDeleted(comment: Comment): boolean` — `!!comment.deletedAt`
- `hasReaction(reactions: Reaction[], type: ReactionType, accountId: string): boolean`
- `aggregateReactionCounts(reactions: Reaction[]): Record<ReactionType, number>`
- `buildComment(id, workspaceId, artifactType, artifactId, authorAccountId, body, now, parentId?)` — already in _entity.ts, re-export

**infra.firestore/_mapper.ts**
- `CommentDoc` interface
- `ReactionDoc` interface
- `commentDocToEntity(doc): Comment`
- `commentEntityToDoc(comment): CommentDoc`
- `reactionDocToVO(doc): Reaction`
- `reactionVOToDoc(reaction): ReactionDoc`

**infra.firestore/_repository.ts**
- `COMMENTS_COLLECTION = "comments"`, `REACTIONS_COLLECTION = "reactions"`
- `FirestoreCommentRepository implements ICommentRepository`
- `FirestoreReactionRepository` (if IReactionRepository port exists)

---

## Wave 16 — search.module + causal-graph.module

### search.module

**Source:** `src/features/global-search.slice/_services.ts` + `semantic-graph.slice/_services.ts`

**domain.search/_service.ts**
- `scoreRelevance(entry: SearchIndexEntry, terms: string[]): number` — TF-style: count term occurrences in title (×3) + snippet (×1), normalized
- `rankResults(entries: SearchIndexEntry[], query: string, limit?: number): SearchResult[]` — score, sort desc, slice
- `filterByVisibility(entries: SearchIndexEntry[], ownerAccountId: string, workspaceId?: string): SearchIndexEntry[]` — `public` entries + entries owned by account
- `buildIndexEntry(id, sourceModule, sourceId, title, snippet, ownerAccountId, tags, visibility, now): SearchIndexEntry`
- `tombstoneEntry(entry: SearchIndexEntry): SearchIndexEntry` — returns copy with `snippet: '[deleted]'`, `title: '[deleted]'`, `tags: []`
- `isVisibleTo(entry: SearchIndexEntry, accountId: string, workspaceId?: string): boolean`

**infra.firestore/_mapper.ts**
- `SearchIndexEntryDoc` interface
- `searchEntryDocToEntity(doc): SearchIndexEntry`
- `searchEntryToDoc(entry): SearchIndexEntryDoc`

**infra.firestore/_repository.ts**
- `SEARCH_INDEX_COLLECTION = "search-index"`
- `FirestoreSearchIndexRepository implements ISearchIndexRepository`
- `FirestoreSearchQueryAdapter implements ISearchQueryPort` — Firestore fallback search (keyword in title field)

### causal-graph.module

**Source:** `src/features/semantic-graph.slice/_aggregate.ts` (BFS/DFS patterns)

**domain.causal-graph/_service.ts**
- `buildCausalNode(id: CausalNodeId, kind: CausalNodeKind, sourceRef: string, label: string, occurredAt: string): CausalNode`
- `buildCausalEdge(id: string, causeNodeId: CausalNodeId, effectNodeId: CausalNodeId, confidence: number): CausalEdge`
- `resolveCausalPath(nodes: CausalNode[], edges: CausalEdge[], fromId: CausalNodeId, toId: CausalNodeId): CausalPath | null` — BFS shortest path
- `computeImpactScope(nodes: CausalNode[], edges: CausalEdge[], triggerNodeId: CausalNodeId, direction: CausalDirection, maxDepth: number): ImpactScope` — BFS bounded traversal
- `detectCycles(nodes: CausalNode[], edges: CausalEdge[]): CausalNodeId[][]` — DFS cycle detection, returns cycle paths
- `mergeImpactScopes(scopes: ImpactScope[]): ImpactScope` — union of affectedNodeIds from same trigger

**infra.firestore/_mapper.ts**
- `CausalNodeDoc` interface
- `CausalEdgeDoc` interface
- `causalNodeDocToEntity(doc): CausalNode`
- `causalNodeToDoc(node): CausalNodeDoc`
- `causalEdgeDocToEntity(doc): CausalEdge`
- `causalEdgeToDoc(edge): CausalEdgeDoc`

**infra.firestore/_repository.ts**
- `CAUSAL_NODES_COLLECTION = "causal-nodes"`, `CAUSAL_EDGES_COLLECTION = "causal-edges"`
- `FirestoreCausalNodeRepository implements ICausalNodeRepository`
- `FirestoreCausalEdgeRepository implements ICausalEdgeRepository`

---

## Serena Memory Updates Required Per Wave

| Wave | Modules | Memory files to update |
|------|---------|----------------------|
| 14 | file, audit | `.serena/memories/modules/file.md`, `.serena/memories/modules/audit.md` |
| 15 | fork, collaboration | `.serena/memories/modules/fork.md`, `.serena/memories/modules/collaboration.md` |
| 16 | search, causal-graph | `.serena/memories/modules/search.md`, `.serena/memories/modules/causal-graph.md` |

After Wave 16 all 16 modules will have complete domain service + infra (mapper + repository).

---

## Acceptance Criteria Per Wave

1. TypeScript: `npx tsc --noEmit` passes with 0 errors
2. All 3 files per module implemented: `domain.*/_service.ts`, `infra.firestore/_mapper.ts`, `infra.firestore/_repository.ts`
3. Serena memory updated for both modules
4. CodeQL: 0 alerts on changed files

---

## Wave 39 — Work Item Edit Dialog ✅

### work.module
- Added `description?: string` to `WorkItemDTO`
- Added `updateWorkItem(repo, id, UpdateWorkItemInput)` use case
- `UpdateWorkItemInput`: `{ title?, description?, status?, priority?, assigneeId?: string|null, dueDate?: string|null }`
- Exported `updateWorkItem` + `UpdateWorkItemInput` from `core/_actions.ts`

### workspace.module _components
- `work-item-edit-dialog.tsx` (NEW): dialog with 6 fields (title, description, status, priority, assignee, due date)
- `work-item-row.tsx`: hover-reveal Pencil edit button, opens `WorkItemEditDialog`
- `wbs-view.tsx`: passes `onUpdated={refresh}` to each `WorkItemRow`

### i18n
- Added `wbs.editDialog.*` (8 keys) + `wbs.priority.*` (4 keys) — zh-TW + en-US

---

## Wave 42 — Workspace Sub-Locations Panel ✅

### workspace.module
- Extended `WorkspaceLocation` in `_entity.ts` with `type?: "building"|"floor"|"room"` and `parentId?: string`
- Updated `infra.firestore/_mapper.ts` to round-trip `type` and `parentId`
- Added `addWorkspaceLocation(repo, workspaceId, {id, label, type, parentId?})` use case
- Added `removeWorkspaceLocation(repo, workspaceId, locationId)` use case (cascades children)
- Exported both from `core/_actions.ts`
- New `workspace-locations-view.tsx`: buildings → floors → rooms hierarchy, add/delete per type with AlertDialog
- New route: `app/(main)/[slug]/[workspaceId]/(workspace)/locations/page.tsx`
- `workspace-nav-tabs.tsx`: permanent `locations` tab between members and business caps
- i18n: `workspace.nav.locations` + all `workspace.locations.*` keys (zh-TW + en)

---

## Wave 43 — Advanced WBS Task Tree Engine ⬜ (NEXT)

**Source:** `workspace.slice/domain.tasks/_components/tasks-view.tsx`, `task-tree-node.tsx`, `task-editor-dialog.tsx`, `attachments-dialog.tsx`, `attachments-action.tsx`, `location-dialog.tsx`, `location-action.tsx`, `progress-report-dialog.tsx`

**What:** Our current WbsView is a simple flat list. The source has a full tree-based WBS system ("WBS Engineering Task Governance Center").

### work.module domain extension
- Extend `WorkItem` entity with: `parentId?`, `quantity`, `unitPrice`, `discount`, `subtotal`, `completedQuantity`, `type` (string), `wbsNo` (auto-computed), `location?` (building/floor/room/description), `photoURLs?` (attachment URLs), `sourceIntentIndex?`
- `buildTaskTree(tasks): TaskWithChildren[]` — flat list → tree with wbsNo auto-numbering and `descendantSum` budget roll-up
- Budget constraint validation: children sum ≤ parent subtotal

### workspace.module _components (new)
- `task-tree-node.tsx` — recursive tree row; expand/collapse; 8 configurable columns (type, priority, location, attachments, discount, subtotal, progress, status); actions: add-child, edit, delete, report-progress, schedule-request, mark-blocked, submit-for-QA
- `task-editor-dialog.tsx` — full task form (name, type, parentId, priority, quantity, unitPrice, discount, location, progressState)
- `location-action.tsx` + `location-dialog.tsx` — building/floor/room/description sub-dialog
- `attachments-action.tsx` + `attachments-dialog.tsx` — photoURL list management
- `progress-report-dialog.tsx` — report completedQuantity
- Replace `WbsView` flat list with tree view (import `buildTaskTree`, render `TaskTreeNode`)

### i18n
- `tasks.wbsTitle`, `tasks.wbsDescription`, `tasks.taskEngineering`
- `tasks.viewOptions`, `tasks.visibleColumns`, `tasks.taskType`, `tasks.attachments`, `tasks.discount`, `tasks.budget`, `tasks.progress`, `tasks.status`
- `tasks.createRootNode`, `tasks.splitIntoSubtasks`, `tasks.progressReport`, `tasks.sendScheduleRequest`, `tasks.markAsBlocked`, `tasks.deleteNode`, `tasks.submitForQa`
- `tasks.awaitingDefinition`, `tasks.createFirstTask`
- `tasks.budgetOverflow`, `tasks.budgetOverflowDescription`, `tasks.budgetConflict`, `tasks.budgetConflictDescription`
- `tasks.failedToSaveTask`, `tasks.failedToDeleteTask`, `tasks.progressUpdated`, `tasks.taskSubmittedForQa`, `tasks.taskBlocked`, `tasks.taskBlockedDesc`, `tasks.confirmDestroyNode`
- `tasks.imagePreviewTitle`, `tasks.imagePreviewDescription`, `tasks.attachmentPreviewAlt`

---

## Wave 44 — Create Workspace Dialog ⬜

**Source:** `workspace.slice/core/_components/create-workspace-dialog.tsx`

### workspace.module _components
- `create-workspace-dialog.tsx` — Dialog with name input → calls `createWorkspace` use case (already exists)
- Wire `WorkspacesView` header "+ Create" button to open the dialog

### i18n
- `workspaces.createLogicalSpace`, `workspaces.createDescription`, `workspaces.spaceName`, `workspaces.spaceNamePlaceholder`
- `common.creating`, `common.confirmCreation`

---

## Wave 45 — Daily Log View ⬜ (capability-gated: "daily")

**Source:** `workspace.slice/domain.daily/_components/`

### workspace.module _components (new)
- `daily-log-card.tsx` — card showing daily log entry (date, content, photos)
- `daily-log-dialog.tsx` — create/edit dialog (date, text content, photoURLs)
- `composer.tsx` — post composer for quick daily entries
- `image-carousel.tsx` — carousel for post photos
- `daily-workspace-view.tsx` — workspace-scoped daily log feed
- Route: `/[slug]/[workspaceId]/(workspace)/daily`
- `WorkspaceNavTabs` updated with `daily` tab (when capability mounted)

### i18n
- `workspace.nav.daily`, `workspace.daily.*` keys

---

## Wave 46 — Issues View ⬜ (capability-gated: "issues")

**Source:** `workspace.slice/domain.issues/_components/issues-view.tsx`

### workspace.module _components (new)
- `issues-view.tsx` — full issues CRUD view (list/create/edit/close issues)
- Route: `/[slug]/[workspaceId]/(workspace)/issues`
- `WorkspaceNavTabs` updated with `issues` tab (when capability mounted)

### i18n
- `workspace.nav.issues`, `workspace.issues.*` keys

---

## Wave 41 — Work Item Delete + Description Display ✅

### work.module
- Added `deleteWorkItem(repo, workspaceId, workItemId)` use case
- Exported from `core/_actions.ts`

### workspace.module _components
- `work-item-row.tsx`: Trash2 delete button (group-hover reveal) → AlertDialog → deleteWorkItem; description second line (truncated)
- `wbs-view.tsx`: passes `onDeleted={refresh}` to WorkItemRow
- i18n: `wbs.deleteDialog.{title,description,confirm,cancel}` (zh-TW + en)

---

## Wave 40 — Workspace Photo URL ✅

### workspace.module _components
- `workspace-settings-dialog.tsx`: added `photoURL` URL input field with live preview image, passes `photoURL` to `updateWorkspaceSettings`

### i18n
- Added `workspace.settings.photoURLLabel` + `workspace.settings.photoURLPlaceholder`

---

## Phase 2 — Presentation Layer (所有 Waves 完成後的下一階段)

> Status: ✅ **All pages completed** — Waves 17–22 delivered full Presentation Layer parity with 7Spade/xuanwu.
> Auth UI (Wave 17), Shell (Wave 18), workspaces + profile + onboarding (Wave 19), 9 settings/route pages (Waves 20–21), AccountProvider + real Firestore data (Wave 22).
> Source reference: `7Spade/xuanwu` has 99 `_components/*.tsx` files across all feature slices.
> Target: `src/modules/*/_components/` + `src/app/` pages.

### Current State (App pages)

| Page | Path | Status |
|------|------|--------|
| Root redirect | `src/app/page.tsx` | ✅ Shows platform info |
| Login/Register | `src/app/(auth)/login/page.tsx` | ✅ Wave 17 |
| Register (redirect) | `src/app/(auth)/register/page.tsx` | ✅ Wave 17 |
| Forgot Password | `src/app/(auth)/forgot-password/page.tsx` | ✅ Wave 17 |
| Onboarding | `src/app/(main)/onboarding/page.tsx` | ✅ Wave 19 |
| Workspaces list | `src/app/(main)/[slug]/workspaces/page.tsx` | ✅ Wave 19 (real data Wave 22) |
| WBS | `src/app/(main)/[slug]/[workspaceId]/(workspace)/wbs/page.tsx` | ✅ Wave 21 (data ✅ Wave 25) |
| Editor | `src/app/(main)/[slug]/[workspaceId]/(standalone)/editor/page.tsx` | ✅ Wave 21 (data ✅ Wave 29) |
| Profile settings | `src/app/(main)/(account)/profile/page.tsx` | ✅ Wave 19 (real data Wave 22) |
| Security settings | `src/app/(main)/(account)/security/page.tsx` | ✅ Wave 20 |
| Notifications | `src/app/(main)/(account)/notifications/page.tsx` | ✅ Wave 20 (data Wave 24) |
| Organizations | `src/app/(main)/(account)/organizations/page.tsx` | ✅ Wave 20 (data Wave 23) |
| Org general settings | `src/app/(main)/[slug]/settings/general/page.tsx` | ✅ Wave 20 (data Wave 23) |
| Org members | `src/app/(main)/[slug]/settings/members/page.tsx` | ✅ Wave 20 (data ✅ Wave 26) |
| Org billing | `src/app/(main)/[slug]/settings/billing/page.tsx` | ✅ Wave 20 (data ✅ Wave 27) |
| Org API keys | `src/app/(main)/[slug]/settings/api-keys/page.tsx` | ✅ Wave 20 (data ✅ Wave 28) |
| Admin | `src/app/(admin)/admin/page.tsx` | ✅ Wave 21 |
| Share | `src/app/(shared)/share/[shareId]/page.tsx` | ✅ Wave 21 |
| Invite | `src/app/(invite)/invite/[token]/page.tsx` | ✅ Wave 21 |

### Identity module components — Wave 17 (AUTH UI)

**Files completed:**
- `src/modules/identity.module/_components/login-form.tsx` ✅
- `src/modules/identity.module/_components/register-form.tsx` ✅
- `src/modules/identity.module/_components/reset-password-form.tsx` ✅
- `src/modules/identity.module/_components/auth-tabs-root.tsx` ✅
- `src/modules/identity.module/_components/auth-view.tsx` ✅
- `src/modules/identity.module/_client-actions.ts` ✅

**i18n keys added to `src/shared/i18n/index.ts`:**
- auth.* keys (login, register, email, password, etc.)

### Next Priorities (Waves 23–28)

| Wave | Scope | Target modules |
|------|-------|----------------|
| 23 | Organization data (OrganizationsView + org settings real data) | `namespace.module`, `account.module` | ✅ Done |
| 24 | Real-time notifications (NotificationsView real data) | `notification.module` | ✅ Done |
| 25 | WBS task tree real data | `work.module`, `workspace.module` | ✅ Done |
| 26 | Members settings real data | `account.module` (IMembershipRepository) | ✅ Done |
| 27 | Org Settings real data (WorkspaceSettingsView + BillingView) | `namespace.module` | ✅ Done |
| 28 | ApiKeysView real data (ApiKey domain + useApiKeys hook) | `identity.module` | ✅ Done |
| 29 | EditorView real data (useFiles hook + FileItem, wired to file.module) | `file.module`, `workspace.module` | ✅ Done |

### Remaining static shells

All Phase 2 presentation shells are now wired to real Firestore data. **Phase 2 complete.**

| Shell | Status |
|-------|--------|
| EditorView | ✅ Wave 29 — file browser panel via file.module |

### Next Phase — Phase 3: Write-side actions & collaboration

### Acceptance Criteria for Presentation Waves

1. TypeScript: `npx tsc --noEmit` passes with 0 errors
2. Components use `@/design-system/primitives/ui/` (NOT `@/shadcn-ui/`)
3. i18n via `useTranslation("zh-TW")` from `@/shared/i18n`
4. No direct infrastructure imports in components (go through module barrel `index.ts`)
5. Pages use real Firestore data via module hooks (no Placeholder shells)
