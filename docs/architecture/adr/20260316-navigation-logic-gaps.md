# ADR-008: Navigation Logic Gaps — End-to-End Audit Findings

**Date**: 2026-03-16  
**Status**: Proposed  
**Auditor**: Serena (automated end-to-end navigation audit, PR #20)

---

## Context

A full end-to-end navigation audit was conducted on the Xuanwu platform to verify that every route and navigation action forms a valid, logically-complete user flow. The audit examined all pages under `src/app/`, all route groups, sidebar navigation, authentication redirects, and post-login routing.

This ADR records **logic-layer issues**: missing authentication guards, incorrect redirect destinations, dead-end routes, and data-resolution mismatches that silently produce wrong results.

---

## Issues Found

### C-1 🔴 CRITICAL — No Authentication Guard on `(main)` Routes

**File**: `src/app/(main)/layout.tsx`; no `middleware.ts` found.

Any unauthenticated visitor can navigate directly to `/dashboard`, `/workspaces`, `/profile`, `/[slug]/[workspaceId]/wbs`, and all other `(main)` routes. There is no Next.js `middleware.ts`, no server-side redirect, and no client-side auth guard at the layout level.

`AccountProvider` sets `user: null` and `account: null` when unauthenticated and stops loading. Individual components that check `if (!user || !account) return null` silently render nothing — the full app shell (sidebar, header) is still visible, but all content areas are blank.

**Impact**: Blank-shell UX for unauthenticated users; confidential UI structure exposed; no redirect to login.

**Fix**: Add `middleware.ts` at the project root (or `src/`) with a matcher protecting all `/(main)` routes. Redirect to `/login?callbackUrl={encodedPath}`. Alternatively, add an auth guard in `(main)/layout.tsx` that reads server-side session and redirects when unauthenticated.

---

### C-2 🔴 CRITICAL — Post-Login Always Defaults to `/onboarding`

**File**: `src/modules/identity.module/_components/auth-view.tsx` (lines 38–55, 103–105).

`resolvePostLoginUrl` has a hardcoded fallback of `"/onboarding"`. The `callbackUrl` query parameter is only populated by the marketing header login button — and that button passes `?callbackUrl=/` (the marketing homepage, not the dashboard). Result:

| Login entry point | `callbackUrl` | Actual redirect |
|---|---|---|
| Marketing "Login" button | `/` | → `/` (marketing page — wrong) |
| Direct `/login` navigation | none | → `/onboarding` (wrong for returning users) |
| Future middleware redirect | correct path | → correct path ✓ |

Returning users who have already completed onboarding are sent back through onboarding on every login.

**Impact**: Disrupted returning-user experience; every authenticated session starts at onboarding regardless of context.

**Fix**:
1. Change `resolvePostLoginUrl` fallback from `"/onboarding"` to `"/dashboard"`.
2. Update the marketing header login button `href` from `/login?callbackUrl=/` to `/login?callbackUrl=/dashboard`.

---

### H-4 🟠 HIGH — Breadcrumb Segments Lead to Blank Pages

**Files**: `src/app/(main)/[slug]/default.tsx`; `src/modules/workspace.module/_components/shell/shell-header.tsx`.

`ShellHeader` generates clickable breadcrumb links for every URL path segment. For a URL like `/my-org/ws-abc123/wbs`, clicking the `my-org` breadcrumb navigates to `/my-org`, which has no `page.tsx` — `[slug]/default.tsx` returns `null` — resulting in a blank content area with the full app shell.

```tsx
// [slug]/default.tsx — current
export default function Default() {
  return null;  // ← blank page
}
```

Note: `[slug]/[workspaceId]` already has a redirect in `(workspace)/default.tsx` (→ `/wbs`), so only the bare `/{slug}` is affected.

**Impact**: Clicking a breadcrumb segment silently navigates to a blank page with no error or redirect.

**Fix**: Replace `[slug]/default.tsx` `null` return with `redirect("/{slug}/workspaces")`, making `/{slug}` forward users to the org's workspace list.

---

### H-5 🟠 HIGH — Anonymous Sign-In Is a Dead End

**Files**: `src/modules/identity.module/_components/auth-view.tsx` (lines 115–124); `src/modules/account.module/_components/account-provider.tsx`.

The "Guest" login button calls `clientSignInAnonymously()` then navigates to `/onboarding` (the default fallback). However:

1. No `AccountDTO` is created in Firestore for anonymous Firebase Auth users.
2. `AccountProvider.onAuthStateChanged` calls `getAccountById(repo, uid)`, receives `null`, and sets `account: null`.
3. The onboarding page renders the full app shell (because `(main)/layout.tsx` always renders), but `AccountProvider` has `account: null`.
4. Every component guarded by `if (!user || !account) return null` silently shows nothing.

**Impact**: Anonymous users see a blank onboarding shell and cannot proceed; no error message is displayed.

**Fix** (choose one):
- Provision a transient `AccountDTO` for anonymous users on sign-in (guest account flow).
- Redirect anonymous users to a dedicated guest landing page outside `(main)`.
- Remove the anonymous sign-in option until a guest flow is designed.

---

### M-4 🟡 MEDIUM — `/{slug}/workspaces` Fetches Wrong Account's Data

**Files**: `src/app/(main)/[slug]/workspaces/page.tsx`; `src/modules/workspace.module/_components/workspaces-view.tsx` (lines 49–52).

The server component passes only `slug` (for href construction) but omits `dimensionId`. `WorkspacesView` resolves it via `activeAccount?.id`. If the URL slug does not match the active account — for example, a user directly navigates to `/other-org/workspaces` while their active account is their personal one — the view displays the wrong account's workspaces.

```tsx
// [slug]/workspaces/page.tsx
return <WorkspacesView slug={slug} />;  // no dimensionId — resolves from activeAccount

// workspaces-view.tsx
const effectiveDimensionId = dimensionId ?? activeAccount?.id ?? account?.id ?? null;
// ↑ may not correspond to `slug`
```

**Impact**: Users who share or bookmark org-specific workspace URLs see their personal workspaces instead.

**Fix**: Resolve the namespace entity by `slug` server-side and pass the matching `dimensionId` explicitly to `WorkspacesView`, or add a `useNamespaceBySlug` hook client-side.

---

### M-2 🟡 MEDIUM — `/register` and `/forgot-password` Lose Navigation Intent

**Files**: `src/app/(auth)/register/page.tsx`; `src/app/(auth)/forgot-password/page.tsx`.

Both pages redirect unconditionally to `/login`:

```tsx
export default function RegisterPage() { redirect("/login"); }
export default function ForgotPasswordPage() { redirect("/login"); }
```

`AuthView` has no mechanism to auto-open the register tab or the reset dialog from URL parameters. Users arriving at `/register` (e.g., from an email invite link) see the login tab with no indication that they should register.

**Impact**: Email invite links and external register links silently land on the login tab; users may not know to switch tabs.

**Fix**: Support `?tab=register` and `?openReset=true` query parameters in `AuthViewInner` to initialise the correct tab or dialog state on mount.

---

## Decision

Record all findings above as tracked issues. Address them in priority order:

1. **Immediate** (blocks user acceptance): C-1, C-2
2. **Short-term** (core UX gaps): H-4, H-5
3. **Medium-term** (correctness polish): M-4, M-2

Each fix should be implemented as a focused pull request with its own test coverage.

---

## Consequences

- Addressing C-1 requires adding `middleware.ts` — a new infrastructure file affecting all routes; review carefully for side effects on invite and share links that must remain unauthenticated.
- Addressing C-2 changes the default post-login destination from `/onboarding` to `/dashboard`; ensure onboarding is still reachable for new users (e.g., via a first-time-login flag on the `AccountDTO`).
- Addressing H-4 adds a server-side redirect from `/{slug}` to `/{slug}/workspaces`; consider whether an org landing page is preferable long-term.
- Addressing H-5 requires a product decision on guest/anonymous access scope before implementation.

---

## Alternatives Considered

- **Soft client-side auth guard in `AccountProvider`**: would still flash the app shell briefly and is harder to maintain than a single middleware.
- **Keeping `/onboarding` as default fallback but adding account check**: an `AccountDTO.onboardingComplete` flag could route returning users to `/dashboard`; viable but requires schema migration.

---

## Status

`proposed`

---

## Related Issues

- ADR-009: UI/UX Navigation Gaps (companion record for UI-layer findings from the same audit)
- PR #20: Serena end-to-end audit
