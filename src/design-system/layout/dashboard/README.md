# `src/design-system/layout/dashboard/` — Authenticated App Layouts

## Purpose

Pure UI layout components for authenticated (dashboard) pages. These are **presentation-only** — they have no business logic and accept all dynamic data as props.

## Components

| Component | Purpose |
|-----------|---------|
| **`DashboardShell`** | Main container combining sidebar + header + content area |
| **`ShellHeader`** | Sticky top header with breadcrumbs and search trigger |
| **`NavMain`** | Primary navigation menu (home, workspaces, notifications, etc.) |
| **`NavTopWorkspaces`** | List of workspaces with expand/collapse |
| **`NavUser`** | User profile menu in sidebar footer |

## Usage Pattern

These components are **presentation-tier** in the DDD layer hierarchy. They should be composed in either:

1. **`src/app/(main)/layout.tsx`** — App-level layout orchestrator that:
   - Wraps these components with actual business logic
   - Fetches user data from `account.module`
   - Passes workspace data from `workspace.module`
   - Resolves breadcrumbs from the current route

2. **App-specific wrappers** — Each module can provide its own "smart" version:
   - `account.module/_components/nav-user-orchestrated.tsx` (wraps pure `NavUser` with hooks)
   - `workspace.module/_components/nav-top-workspaces-orchestrated.tsx` (wraps pure version with queries)

## Example (App-Level Orchestrator)

```tsx
// src/app/(main)/layout.tsx
import { DashboardShell, ShellHeader, NavMain, NavTopWorkspaces, NavUser } from "@/design-system/layout/dashboard";
import { useCurrentAccount } from "@/modules/account.module";
import { useWorkspaces } from "@/modules/workspace.module/_hooks";

export default function MainLayout({ children }: { children: ReactNode }) {
  const { user, account } = useCurrentAccount();
  const { workspaces } = useWorkspaces(account?.id);

  return (
    <DashboardShell
      header={<ShellHeader breadcrumbs={breadcrumbs} />}
      sidebar={
        <>
          <NavMain items={navItems} pathname={pathname} />
          <NavTopWorkspaces workspaces={workspaces} slug={account?.handle} />
        </>
      }
    >
      {children}
    </DashboardShell>
  );
}
```

## Import Pattern

```typescript
// ✅ Correct — import from design-system
import { DashboardShell, NavMain } from "@/design-system/layout/dashboard";

// ❌ Wrong — do not import from workspace.module internals
import { DashboardSidebar } from "@/modules/workspace.module/_components/shell";
```

## Design Principles

1. **Props-driven** — All dynamic content flows in via props, never via hooks inside
2. **No business logic** — Pure rendering based on input data
3. **Composable** — Each sub-component can be used independently in various shell layouts
4. **i18n-aware** — Pass labels/text as props; component does not call `useTranslation`
