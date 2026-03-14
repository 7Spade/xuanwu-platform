# Xuanwu Platform — Structural Transformation Map

> Purpose: Every source `7Spade/xuanwu` component/page mapped to its exact target in `xuanwu-platform`.
> This document is the single source of truth for the Presentation Layer migration.
> Updated: 2026-03-14 (Wave 19 analysis)

---

## Core Principle

The problem statement says: **"必須先了解目標結構再逐步思考要如何轉換過來"** —
understand the target structure first, then think step-by-step about how to convert.

### Structural Transformation

| Source concept | Target concept | Notes |
|---|---|---|
| `src/features/*.slice/` | `src/modules/*.module/` | Domain boundary preserved |
| `src/features/*/core/_components/` | `src/modules/*/_components/` | Component placement |
| `src/features/*/core/_hooks/` | `src/modules/*/_hooks/` (or shared) | Client-only hooks |
| `src/features/*/core/_queries.ts` | `src/modules/*/core/_queries.ts` | ✅ Already done |
| `src/features/*/core/_actions.ts` | `src/modules/*/core/_actions.ts` | ✅ Already done |
| `src/app/(shell)/` | `src/app/(main)/` | Route group |
| `src/app-runtime/providers/` | TBD — inline or `src/infrastructure/providers/` | Auth+i18n providers |
| `@/shadcn-ui/*` | `@/design-system/primitives/ui/*` | UI primitives |
| `@/lib-ui/custom-ui` | TBD — inline or `@/design-system/custom/` | Custom UI |
| `useI18n()` from app-runtime | `useTranslation("zh-TW")` from `@/shared/i18n` | i18n hook |
| `ROUTES.*` from shared-kernel | Inline paths or shared constants | Route constants |

---

## Page → Component Mapping

### Auth Pages (✅ Done — Wave 17)

| App Route | Source Page | Target Component |
|---|---|---|
| `/login` | `identity.slice` login flow | `identity.module/_components/auth-view.tsx` ✅ |
| `/register` | redirects to /login | redirect ✅ |
| `/forgot-password` | redirects to /login | redirect ✅ |

### Main Shell Layout (✅ Done — Wave 18)

| Element | Source | Target |
|---|---|---|
| Sidebar shell | `workspace.slice/core/_components/shell/` | `workspace.module/_components/shell/` ✅ |
| Nav main | source shell | `nav-main.tsx` ✅ |
| Nav user | source shell | `nav-user.tsx` ✅ |
| Dashboard sidebar | source shell | `dashboard-sidebar.tsx` ✅ |
| Shell header | source shell | `shell-header.tsx` ✅ |
| Main layout | `src/app/(shell)/layout.tsx` | `src/app/(main)/layout.tsx` ✅ |

### Dashboard / Home (Wave 19 — Next)

| App Route | Source | Target Component | Status |
|---|---|---|---|
| `/` (home) | `src/app/(shell)/(portal)/(account)/(dashboard)/page.tsx` | Uses `DashboardView` | ✅ |
| `workspace.slice/core/_components/dashboard-view.tsx` | Source component | `workspace.module/_components/dashboard-view.tsx` | ✅ |

### Workspaces List (Wave 19)

| App Route | Source | Target Component | Status |
|---|---|---|---|
| `/[slug]/workspaces` | `src/app/(shell)/(portal)/(account)/(workspaces)/page.tsx` | uses `WorkspacesView` | ✅ |
| `workspace.slice/core/_components/workspaces-view.tsx` | Source | `workspace.module/_components/workspaces-view.tsx` | ✅ |
| `workspace.slice/core/_components/workspace-list-header.tsx` | Source | `workspace.module/_components/workspace-list-header.tsx` | ✅ |
| `workspace.slice/core/_components/workspace-card.tsx` | Source (19K) | `workspace.module/_components/workspace-card.tsx` | ✅ |
| `workspace.slice/core/_components/workspace-grid-view.tsx` | Source | `workspace.module/_components/workspace-grid-view.tsx` | ✅ |
| `workspace.slice/core/_components/workspace-table-view.tsx` | Source | `workspace.module/_components/workspace-table-view.tsx` | ✅ |

### Profile / User Settings (Wave 19)

| App Route | Source | Target Component | Status |
|---|---|---|---|
| `/(account)/profile` | Source `user-settings-view.tsx` | `account.module/_components/user-settings-view.tsx` | ✅ |
| — | `account.slice/domain.profile/_components/profile-card.tsx` | `account.module/_components/profile-card.tsx` | ✅ |
| — | `account.slice/domain.profile/_components/email-card.tsx` | `account.module/_components/email-card.tsx` | ✅ |
| — | `account.slice/domain.profile/_components/security-card.tsx` | `account.module/_components/security-card.tsx` | ✅ |
| — | `account.slice/domain.profile/_components/preferences-card.tsx` | `account.module/_components/preferences-card.tsx` | ✅ |

### Security Settings (Wave 20)

| App Route | Source | Target Component | Status |
|---|---|---|---|
| `/(account)/security` | Source `security-card.tsx` promoted to page | `account.module/_components/security-view.tsx` | ✅ |

### Notifications (Wave 20)

| App Route | Source | Target Component | Status |
|---|---|---|---|
| `/(account)/notifications` | `notification-hub.slice/_components/` | `notification.module/_components/notifications-view.tsx` | ✅ |

### Organizations (Wave 20)

| App Route | Source | Target Component | Status |
|---|---|---|---|
| `/(account)/organizations` | `organization.slice/_components/` | `namespace.module/_components/organizations-view.tsx` | ✅ |

### Org Settings (Wave 20)

| App Route | Source | Target Component | Status |
|---|---|---|---|
| `/[slug]/settings/general` | `workspace.slice/core/_components/workspace-settings.tsx` | `workspace.module/_components/workspace-settings.tsx` | ✅ |
| `/[slug]/settings/members` | `workspace.slice/gov.members/_components/` | `workspace.module/_components/members-settings-view.tsx` | ✅ |
| `/[slug]/settings/billing` | `finance.slice/_components/` | `settlement.module/_components/billing-view.tsx` | ✅ |
| `/[slug]/settings/api-keys` | `identity.slice/_components/api-keys*` | `identity.module/_components/api-keys-view.tsx` | ✅ |

### WBS / Editor (Wave 21)

| App Route | Source | Target Component | Status |
|---|---|---|---|
| `/[slug]/[workspaceId]/wbs` | `workspace.slice/domain.tasks/_components/` | `workspace.module/_components/wbs-view.tsx` | ✅ |
| `/[slug]/[workspaceId]/editor` | `workspace.slice/domain.document-parser/` | `workspace.module/_components/editor-view.tsx` | ✅ |

### Admin / Share / Invite (Wave 21)

| App Route | Source | Target | Status |
|---|---|---|---|
| `/admin` | Simple admin panel | `src/app/(admin)/admin/page.tsx` | ✅ |
| `/share/[shareId]` | `portal.slice/_components/` | `src/app/(shared)/share/` | ✅ |
| `/invite/[token]` | `organization.slice/_components/invite*` | `namespace.module/_components/invite-view.tsx` | ✅ |

---

## Onboarding (Wave 19)

| App Route | Source | Target Component | Status |
|---|---|---|---|
| `/onboarding` | Multi-step onboarding wizard | `identity.module/_components/onboarding-view.tsx` | ✅ (page) |

---

## i18n Key Migration

All source `t("key")` calls use `@/app-runtime/providers/i18n-provider` (`useI18n` hook).
Target uses `useTranslation("zh-TW")` from `@/shared/i18n`.

### Keys already added

| Namespace | Keys |
|---|---|
| `auth.*` | signIn, register, forgotPassword, signOut, email, password, ... |
| `nav.*` | home, workspaces, account, mainMenu, profileSettings, breadcrumb.* |
| `app.*` | name |
| `home.*` | welcome, started |
| `common.*` | loading |

### Keys to add (Waves 19+)

| Namespace | Keys needed |
|---|---|
| `workspaces.*` | title, description, createSpace, createInitialSpace, spaceVoid, noSpacesFound, searchPlaceholder, workspaceNodes, yourRole, personalDimension, personalDimensionHelp, personalDimensionDescription |
| `settings.*` | dimensionManagementDescription, personalDimensionDescription |
| `profile.*` | title, displayName, email, bio, saveChanges, avatarUrl |
| `security.*` | title, changePassword, currentPassword, newPassword, confirmPassword |
| `notifications.*` | title, markAllRead, empty |
| `organizations.*` | title, createOrg, noOrgs |
| `common.*` | filter, save, cancel, delete, edit, loading |

---

## Migration Wave Order

| Wave | Scope | Pages unblocked |
|---|---|---|
| 17 ✅ | Auth UI | /login |
| 18 ✅ | Shell | all (main) routes |
| 19 ✅ | Workspaces list + Profile + Onboarding | /[slug]/workspaces, /(account)/profile, /onboarding |
| 20 ✅ | Security + Notifications + Organizations + Org Settings | ✅ all pages |
| 21 ✅ | WBS + Editor + Admin + Share + Invite | ✅ all pages |

---

## Infrastructure Provider Gap

The source uses `src/app-runtime/providers/` for:
- `auth-provider.tsx` — wraps Firebase auth state, exposes `useAuth()`
- `i18n-provider.tsx` — wraps translations, exposes `useI18n()`
- `app-provider.tsx` — aggregates accounts + active account, exposes `useApp()`

The target must create equivalent providers in `src/infrastructure/providers/`:
- `auth-provider.tsx` — will replace `NavUser`'s direct `onAuthStateChanged`
- (i18n is already handled via `useTranslation("zh-TW")` — no provider needed)
- `account-provider.tsx` — for `useActiveAccount()` hook

**This is needed for Waves 20–21** (organization context pages require `useApp()`).
For Wave 19, simpler patterns (direct Firebase auth, server queries) are sufficient.
| 22 ✅ | AccountProvider + real data connectivity | All (main) routes now have live Firestore data |

---

## Wave 22 Completed Components

| Source (7Spade/xuanwu) | Target (xuanwu-platform) | Status |
|---|---|---|
| `app-runtime/providers/auth-provider.tsx` + `app-provider.tsx` | `account.module/_components/account-provider.tsx` | ✅ Wave 22 |
| `workspace.slice/core/_hooks/use-workspaces.ts` | `workspace.module/_components/use-workspaces.ts` | ✅ Wave 22 |
| WorkspacesView (server props) | WorkspacesView (self-fetches via useWorkspaces) | ✅ Wave 22 |
| NavUser (own onAuthStateChanged) | NavUser (useCurrentAccount) | ✅ Wave 22 |
| ProfileCard (own onAuthStateChanged) | ProfileCard (useCurrentAccount) | ✅ Wave 22 |

## Remaining Waves

| Wave | Scope | Target modules |
|---|---|---|
| 23 | Organization data (OrganizationsView + settings) | namespace.module, account.module |
| 24 | Real-time notifications | notification.module |
| 25 | WBS task tree real data | work.module |
| 26 | Members settings real data | account.module (IMembershipRepository) |

---

## Waves 30–42 Completed (Workspace Parity — PR #14 / current PR)

| Wave | Scope | Key Components Added | Status |
|------|-------|---------------------|--------|
| 30 | Audit presentation | WorkspaceAuditView, DashboardView upgrade, /audit route | ✅ |
| 31 | WorkspaceShell + nav tabs | workspace-shell.tsx, workspace-nav-tabs.tsx, use-workspace.ts | ✅ |
| 32 | Capabilities model + view | WorkspaceCapabilitiesView, /capabilities route | ✅ |
| 33 | StatusBar + dynamic tabs | workspace-status-bar.tsx, WorkspaceGrantsView (read-only) | ✅ |
| 34 | Settings write-path | WorkspaceSettingsDialog (full form) + WorkspaceCapabilitiesView (interactive) | ✅ |
| 35 | Access-control write-path | WorkspaceGrantsView interactive (invite/role/revoke) | ✅ |
| 36 | Delete workspace | WorkspaceSettingsDialog Danger Zone AlertDialog | ✅ |
| 37 | WorkspaceCard interactive | lifecycle advance + settings gear on WorkspaceCard | ✅ |
| 38 | WBS create task | CreateWorkItemDialog + WbsView "+ Add Task" | ✅ |
| 39 | Work item inline edit | WorkItemEditDialog + WorkItemRow hover-pencil | ✅ |
| 40 | Workspace photo URL | photoURL field + preview in WorkspaceSettingsDialog | ✅ |
| 41 | Work item delete + description | WorkItemRow trash→AlertDialog + description second line | ✅ |
| 42 | Sub-locations panel | WorkspaceLocationsView + /locations route + NavTab | ✅ |

## Next Waves (43–46)

| Wave | Scope | Status |
|------|-------|--------|
| **43** | **Advanced WBS Task Tree Engine** — flat→tree with wbsNo, budget, 8 columns, task-tree-node.tsx, task-editor-dialog.tsx | **⬜ NEXT** |
| 44 | Create Workspace Dialog — create-workspace-dialog.tsx wired to WorkspacesView | ⬜ |
| 45 | Daily Log View — daily-log-card, daily-log-dialog, daily-workspace-view, /daily route | ⬜ |
| 46 | Issues View — issues-view.tsx, /issues route | ⬜ |

## Waves 43–46 Completed (Advanced WBS + Create Workspace + Daily Log + Issues — PR #15 / current PR)

| Wave | Scope | Key Components Added | Status |
|------|-------|---------------------|--------|
| 43 | Advanced WBS Task Tree Engine | TaskTreeNode (recursive), TaskEditorDialog, ProgressReportDialog, LocationDialog, AttachmentsDialog, buildTaskTree utility, createChildWorkItem/reportProgress use cases | ✅ |
| 44 | Create Workspace Dialog | CreateWorkspaceDialog + WorkspacesView "+ Create" wired to dialog | ✅ |
| 45 | Daily Log View | DailyLogEntity, IDailyLogRepository, FirestoreDailyLogRepository, getDailyLogs/createDailyLog/updateDailyLog/deleteDailyLog, DailyWorkspaceView, DailyLogCard, DailyLogDialog, /daily route | ✅ |
| 46 | Issues View | IssueEntity, IIssueRepository, FirestoreIssueRepository, getIssues/createIssue/updateIssue/deleteIssue, IssuesView (full CRUD), /issues route | ✅ |
