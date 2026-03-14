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

## Phase 2 — Presentation Layer (所有 Waves 完成後的下一階段)

> Status: ⬜ Not started. All 16 domain+infra layers done as of Wave 16.
> Source reference: `7Spade/xuanwu` has 99 `_components/*.tsx` files across all feature slices.
> Target: `src/modules/*/_components/` + `src/app/` pages.

### Current State (App pages)

| Page | Path | Status |
|------|------|--------|
| Root redirect | `src/app/page.tsx` | ✅ Shows platform info |
| Login/Register | `src/app/(auth)/login/page.tsx` | ✅ **Implemented** (Wave 17) |
| Register (redirect) | `src/app/(auth)/register/page.tsx` | ✅ **Implemented** (Wave 17) |
| Forgot Password | `src/app/(auth)/forgot-password/page.tsx` | ✅ **Implemented** (Wave 17) |
| Onboarding | `src/app/(main)/onboarding/page.tsx` | ⬜ Placeholder |
| Workspaces list | `src/app/(main)/[slug]/workspaces/page.tsx` | ⬜ Placeholder |
| WBS | `src/app/(main)/[slug]/[workspaceId]/(workspace)/wbs/page.tsx` | ⬜ Placeholder |
| Editor | `src/app/(main)/[slug]/[workspaceId]/(standalone)/editor/page.tsx` | ⬜ Placeholder |
| Profile settings | `src/app/(main)/(account)/profile/page.tsx` | ⬜ Placeholder |
| Security settings | `src/app/(main)/(account)/security/page.tsx` | ⬜ Placeholder |
| Notifications | `src/app/(main)/(account)/notifications/page.tsx` | ⬜ Placeholder |
| Organizations | `src/app/(main)/(account)/organizations/page.tsx` | ⬜ Placeholder |
| Org general settings | `src/app/(main)/[slug]/settings/general/page.tsx` | ⬜ Placeholder |
| Org members | `src/app/(main)/[slug]/settings/members/page.tsx` | ⬜ Placeholder |
| Org billing | `src/app/(main)/[slug]/settings/billing/page.tsx` | ⬜ Placeholder |
| Org API keys | `src/app/(main)/[slug]/settings/api-keys/page.tsx` | ⬜ Placeholder |
| Admin | `src/app/(admin)/admin/page.tsx` | ⬜ Placeholder |
| Share | `src/app/(shared)/share/[shareId]/page.tsx` | ⬜ Placeholder |
| Invite | `src/app/(invite)/invite/[token]/page.tsx` | ⬜ Placeholder |

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

### Next Priority (Wave 18+)

**Workspace Shell** (required for any authenticated page to work):
- `src/modules/workspace.module/_components/shell/dashboard-sidebar.tsx`
- `src/modules/workspace.module/_components/shell/header.tsx`
- `src/modules/workspace.module/_components/shell/nav-workspaces.tsx`
- `src/modules/workspace.module/_components/workspace-card.tsx`
- `src/modules/workspace.module/_components/workspace-list.tsx`

**Work items (WBS)**:
- `src/modules/work.module/_components/task-tree-node.tsx`
- `src/modules/work.module/_components/tasks-view.tsx`

### Acceptance Criteria for Presentation Waves

1. TypeScript: `npx tsc --noEmit` passes with 0 errors
2. Components use `@/design-system/primitives/ui/` (NOT `@/shadcn-ui/`)
3. i18n via `useTranslation("zh-TW")` from `@/shared/i18n`
4. No direct infrastructure imports in components (go through module barrel `index.ts`)
5. Pages updated from `<div>Placeholder</div>` to real components
