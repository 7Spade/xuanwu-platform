# ADR-009: UI/UX Navigation Gaps — End-to-End Audit Findings

**Date**: 2026-03-16  
**Status**: Proposed  
**Auditor**: Serena (automated end-to-end navigation audit, PR #20)

---

## Context

A full end-to-end navigation audit was conducted on the Xuanwu platform to verify that every route and navigation action forms a valid, logically-complete user flow. This ADR records **UI/UX-layer issues**: unreachable pages, misleading entry points, missing back-navigation, broken active-state indicators, and empty route scaffolding that creates user-visible dead ends.

For logic-layer issues (missing auth guard, wrong redirects, data-resolution bugs), see ADR-008.

---

## Issues Found

### H-1 🟠 HIGH — Namespace Settings Pages Are Completely Unreachable

**Files**: `src/app/(main)/[slug]/settings/{general,members,billing,api-keys}/page.tsx`; no links found in any component.

Four fully-implemented settings routes exist with complete UI, but a codebase-wide search for any navigation link to these paths returns **zero results**. They are absent from `NavMain`, `NavUser`, `AccountSwitcher`, `OrgCard`, `DashboardView`, and `WorkspaceNavTabs`.

Routes affected:
- `/{slug}/settings/general` — workspace/org general settings
- `/{slug}/settings/members` — org member management
- `/{slug}/settings/billing` — billing
- `/{slug}/settings/api-keys` — API key management

**Impact**: Users cannot access settings, billing, or member management through any UI path; four feature pages are functionally invisible.

**Fix**: Add a settings entry point accessible from org context — a gear icon in `OrgCard`, a "Settings" item in the sidebar when an org is active, or a dropdown in `DashboardView`.

---

### H-2 🟠 HIGH — Dashboard Always Shows Personal Account; Ignores `activeAccount`

**File**: `src/modules/workspace.module/_components/dashboard-view.tsx` (lines 188–196).

`DashboardView` destructures only `{ user, account, loading }` from `useCurrentAccount()`. The `account` value is always the personal `AccountDTO`. Even when an org is selected via `AccountSwitcher`, the dashboard continues to show the personal account context. `isOrg` is always `false`, so org-specific content (workspace count under org, role badge, audit log) is never displayed.

The "View All" workspaces link also hardcodes the personal handle:

```tsx
const slug = account.handle ?? account.id;  // always personal account
<Link href={`/${slug}/workspaces`}>View All</Link>  // wrong when org is active
```

**Impact**: Switching to an org account via the account switcher produces no visible change on the dashboard; the UI does not reflect the selected context.

**Fix**: Replace `account` with `activeAccount ?? account` in `DashboardView`. The dashboard slug for links should similarly use the active account's handle.

---

### H-3 🟠 HIGH — "Enter Platform" Always Sends Authenticated Users to `/onboarding`

**File**: `src/design-system/layout/marketing/marketing-header.tsx` (line ~143).

When an already-authenticated user visits the marketing homepage and clicks "Enter Platform" from the avatar dropdown, they are sent unconditionally to `/onboarding`:

```tsx
<DropdownMenuItem asChild>
  <Link href="/onboarding">   {/* ← always onboarding, not /dashboard */}
    <LayoutDashboard />
    {t("home.enterPlatform")}
  </Link>
</DropdownMenuItem>
```

**Impact**: Returning authenticated users who visit the homepage are taken through onboarding on every click of "Enter Platform", even if they completed onboarding long ago.

**Fix**: Change the link destination to `/dashboard`. Onboarding should only be triggered for new users (controlled by a first-time-login flag or the absence of a completed `AccountDTO`, not by the entry-point URL).

---

### M-1 🟡 MEDIUM — Marketing Login Button Sends User Back to Marketing Page

**File**: `src/design-system/layout/marketing/marketing-header.tsx` (line ~166).

The login button passes `?callbackUrl=/`:

```tsx
<Link href="/login?callbackUrl=/">{t("home.login")}</Link>
```

After authentication, `resolvePostLoginUrl` honours this value and redirects to `/` — the marketing homepage — rather than the application dashboard.

**Impact**: Users who click "Login" on the homepage are bounced back to the homepage after successful login instead of entering the app.

**Fix**: Change the `href` to `/login?callbackUrl=/dashboard`.

---

### M-3 🟡 MEDIUM — Account Context Switch Has No Navigation Side-Effect

**File**: `src/modules/workspace.module/_components/shell/account-switcher.tsx` (lines 119–131).

Selecting an org in `AccountSwitcher` calls `setActiveAccount(selected)` (React state only) but triggers no navigation. On `/dashboard`, the view does not respond to this change (see H-2). Users see no difference after switching accounts.

**Impact**: Account switching appears broken from the user's perspective; selecting an org does nothing visible.

**Fix**: After `setActiveAccount`, navigate to `/{selectedAccount.handle}/workspaces` to land in the new context, OR update `DashboardView` to be reactive to `activeAccount` so the switch produces an immediate visual update (preferred as H-2 fix).

---

### M-5 🟡 MEDIUM — "tasks" Capability Tab Is Never Active After Its Own Redirect

**File**: `src/modules/workspace.module/_components/workspace-nav-tabs.tsx`.

When a workspace exposes the `"tasks"` capability, the tab links to `/{slug}/{workspaceId}/tasks`. However, `tasks/page.tsx` redirects to `/wbs`. After the redirect, `pathname` is `…/wbs`, but the tab's `isActive` check tests `pathname.startsWith(…/tasks)` — which is always `false`. The "tasks" tab is permanently shown as inactive even while the user is on the WBS page.

**Impact**: The active tab indicator is wrong; users navigating to "tasks" see the WBS content but no highlighted tab, creating confusion about where they are.

**Fix**: In `workspace-nav-tabs.tsx`, add alias detection: when tab id is `"tasks"`, also treat `…/wbs` as an active match.

---

### M-6 🟡 MEDIUM — No Back-Navigation from Workspace to Org Context

**Files**: `src/modules/workspace.module/_components/workspace-shell.tsx`; all workspace pages.

Inside `/{slug}/{workspaceId}/wbs`, there is no "back to workspaces" or "back to org" link in the workspace shell. The available navigation options are:

1. **Breadcrumbs** — `/{slug}` leads to a blank page (see ADR-008 H-4); `/{slug}/{workspaceId}` redirects to `/wbs` (circular).
2. **Sidebar `NavMain`** — links to account-level `/workspaces`, not to the org-specific `/{slug}/workspaces`.
3. **Browser back button** — not a product-controlled affordance.

**Impact**: Users working in a workspace have no discoverable path back to the org's workspace list; navigation context is lost.

**Fix**: Add a back-link chip in `WorkspaceShell` — for example `← {orgHandle}` pointing to `/{slug}/workspaces` — positioned above or alongside the workspace title.

---

### M-7 🟡 MEDIUM — `(marketing)` Route Group Layout Is Never Applied

**File**: `src/app/(marketing)/layout.tsx`.

The `(marketing)` route group has a layout file but contains no pages. The homepage at `src/app/page.tsx` is in the root `app/` directory (not inside `(marketing)/`), so the marketing layout wrapper is never invoked.

**Impact**: Any layout logic intended to wrap the marketing homepage (metadata, analytics, layout classes) is silently skipped.

**Fix**: Move `src/app/page.tsx` into `src/app/(marketing)/page.tsx` so it receives the intended layout wrapper, OR remove the empty `(marketing)/layout.tsx` and document that the marketing layout is applied manually via `HomeLayout`.

---

### L-1 🔵 LOW — `/admin` Route Has No Navigation Entry Point

**File**: `src/app/(admin)/admin/page.tsx`; no link found in any navigation component.

The admin panel is only reachable by typing the URL directly. No role-based nav item exists in `NavMain`, `NavUser`, or any other navigation component.

**Fix**: Add a conditionally-shown "Admin" link in `NavUser` (or `NavMain`) that is visible only when the authenticated user has admin custom claims.

---

### L-2 🔵 LOW — `/firebase-check` Debug Tool in the App Shell Without Access Control

**File**: `src/app/(main)/firebase-check/page.tsx`.

A Firebase connectivity debug tool is mounted inside the `(main)` route group, receiving the full app shell (sidebar + header). It has no role-based access control and no environment guard.

**Fix**: Move to `/admin/firebase-check` (behind an admin role check) or wrap the route with an environment guard (`process.env.NODE_ENV === "development"`) to prevent exposure in production.

---

### L-3 🔵 LOW — Sidebar Nav Shows No Active Item Inside Workspace/Org Routes

**File**: `src/modules/workspace.module/_components/shell/nav-main.tsx`.

Active-state logic uses `pathname.startsWith(href)`. When inside `/my-org/ws-id/wbs`, none of the five sidebar nav items (`/dashboard`, `/workspaces`, `/notifications`, `/organizations`, `/search`) match the current pathname. All items appear inactive.

**Fix**: Add matching logic that highlights "Workspaces" when `pathname` matches a `/{slug}/…` pattern, and potentially add a dynamic org-context nav item when an org is active.

---

### L-4 🔵 LOW — `@sidebar` Parallel Route Slots Are Scaffolded but Return `null`

**Files**: `src/app/(main)/(account)/@sidebar/default.tsx`; `src/app/(main)/[slug]/@sidebar/default.tsx`; `src/app/(main)/[slug]/[workspaceId]/(workspace)/@sidebar/default.tsx`.

All three parallel route sidebar slots return `null`. The architecture for contextual sidebar content is scaffolded but never populated — no secondary nav, breadcrumbs, or contextual actions are rendered in any context.

**Fix**: Either populate these slots with contextual navigation (e.g., workspace capability sub-nav in the `(workspace)/@sidebar/` slot) or remove the parallel route scaffolding to reduce architectural noise and confusion during onboarding of new contributors.

---

## Decision

Record all findings above as tracked issues. Address them in priority order:

1. **Short-term** (core UX gaps): H-1, H-2, H-3
2. **Medium-term** (polish and correctness): M-1, M-3, M-5, M-6, M-7
3. **Low-priority** (housekeeping): L-1, L-2, L-3, L-4

Each fix should be a focused pull request that includes updated i18n keys (if new UI text is added) and relevant tests.

---

## Consequences

- Fixing H-2 (`DashboardView` org-awareness) requires `DashboardView` to consume `activeAccount`; ensure downstream components handle both personal and org `AccountDTO` shapes.
- Fixing H-3 (marketing header) changes the "Enter Platform" destination; coordinate with onboarding logic so new users still reach `/onboarding` on first login (see ADR-008 C-2 fix).
- Fixing M-6 (workspace back-navigation) adds a UI element to `WorkspaceShell`; ensure the new element is i18n-keyed and mobile-responsive.
- Removing L-4 (`@sidebar` parallel routes) is a file-deletion change; verify no code references the empty slots before removing.

---

## Alternatives Considered

- **Single catch-all ADR for all issues**: Rejected; splitting by logic vs. UI/UX layer makes it easier to assign fixes to the correct engineering domain and track independent resolution.
- **Ignoring Low-priority items**: Not recommended; L-2 (`/firebase-check` with no access control) is a minor security concern that should be resolved before production hardening.

---

## Status

`proposed`

---

## Related Issues

- ADR-008: Navigation Logic Gaps (companion record for auth/redirect/data-resolution findings from the same audit)
- PR #20: Serena end-to-end audit
