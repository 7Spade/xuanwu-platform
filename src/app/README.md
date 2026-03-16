# `src/app/` — Next.js App Router

## Purpose

`src/app/` is the **Presentation Layer** entry point. It defines all user-facing routes using Next.js 15 App Router file-based conventions: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`.

This directory owns **routing and layout composition only**. Business logic must live in `src/modules/`.

## Route Structure

```
src/app/
├── layout.tsx          ← Root layout (ThemeProvider, global metadata)
├── page.tsx            ← Home page (/)
├── globals.css         ← Global CSS reset and design tokens
│
├── (admin)/            ← Admin panel routes — /admin/*
├── (auth)/             ← Authentication routes
│   ├── login/          ← /login
│   ├── register/       ← /register
│   └── forgot-password/← /forgot-password
├── (invite)/           ← Invitation acceptance flow — /invite/*
├── (main)/             ← Authenticated app shell
│   ├── (account)/      ← Account settings — /settings/*
│   ├── [slug]/         ← Workspace/namespace dynamic route — /:slug/*
│   ├── firebase-check/ ← Firebase health check endpoint
│   └── onboarding/     ← First-time user setup — /onboarding
├── (marketing)/        ← Public marketing pages
└── (shared)/           ← Public sharing routes — /share/*
```

**Route groups** (`(name)/`) organize routes logically without adding URL path segments.

## Coding Conventions

- **Server Components by default** — add `"use client"` only when browser APIs (event listeners, `useState`, `useEffect`) are needed.
- **Server Actions** — mutations must be implemented in `src/modules/<name>.module/core/_actions.ts` and imported, not inlined in `page.tsx`.
- **Data fetching** — read operations must call module query functions (`_queries.ts`); never call Firestore/Upstash SDKs directly from pages.
- **Layouts** — each route group should have its own `layout.tsx` when it needs a shared shell (navigation, sidebar, auth guard).
- **Metadata** — export a `metadata` object or `generateMetadata()` function from every public-facing `page.tsx`.
- **Error boundaries** — add `error.tsx` to routes that perform async data fetching.
- **i18n** — all user-visible strings must come from `src/shared/i18n/`; never hardcode UI text.

## Import Rules

```typescript
// ✅ Correct — call module public API
import { getWorkspaceBySlug } from "@/modules/workspace.module";

// ✅ Correct — use design system components
import { Button } from "@/design-system/primitives";

// ✅ Correct — use shared utilities
import { formatDate } from "@/shared";

// ❌ Wrong — bypass module layer; call infrastructure directly
import { db } from "@/infrastructure/firebase";
```

## See Also

- Module application layer: [`src/modules/README.md`](../modules/README.md)
- Design system components: [`src/design-system/README.md`](../design-system/README.md)
