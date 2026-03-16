# `src/app/` Agent Rules

Purpose: keep route files thin, enforce Server Component defaults, and prevent direct infrastructure access from the Presentation layer.

This file is mandatory guidance for any agent editing files under `src/app/`.

---

## 0. Non-negotiable Principles

1. `src/app/` is the **Presentation Layer** — no business logic here.
2. All mutations flow through Server Actions defined in module `core/_actions.ts`.
3. All data fetching flows through module query functions in `core/_queries.ts`.
4. Firebase, Upstash, and other SDK imports are **forbidden** in route files.
5. React components are Server Components by default; add `"use client"` only when required.

---

## 1. Dependency Directions

```
src/app/ (page.tsx, layout.tsx)
   ↓  imports from (allowed)
src/modules/<name>.module/index.ts    ← public barrel only
src/design-system/                    ← UI primitives, patterns, layout
src/shared/                           ← utilities, i18n, errors

src/app/ MUST NOT import from:
   src/infrastructure/   ← adapters belong to module infra layer
   src/modules/*/core/   ← only via public index.ts barrel
   src/modules/*/domain.*/ ← never directly
```

---

## 2. Boundary Gate (Run Before Any Edit)

1. Does this page/layout call a module public function from `index.ts`?
2. Is any mutation defined in a Server Action in the owning module, not inlined in the route?
3. Does data fetching use module query functions, not raw SDK calls?
4. Is `"use client"` added only when truly required by browser interaction?
5. Does the route have `metadata` or `generateMetadata()` if it is a public page?
6. Does any new user-facing string have a key in `src/shared/i18n/`?

---

## 3. Red Lines (Hard Fail)

Agent must stop and report when any of the following appears in `src/app/`:

1. `import { db } from "@/infrastructure/firebase"` or any infrastructure SDK.
2. Any Firestore SDK method (`getDocs`, `getDoc`, `addDoc`, `updateDoc`, `deleteDoc`, `onSnapshot`, `collection`, etc.) called directly in a route file.
3. Business logic or invariant enforcement inside `page.tsx` or `layout.tsx`.
4. Cross-module import from another module's internal path (not via `index.ts`).
5. Hardcoded UI text strings (use `src/shared/i18n/` keys instead).

---

## 4. Route File Pattern

```
(group)/
└── route-name/
    ├── page.tsx        ← Server Component; fetches via module query; renders layout
    ├── layout.tsx      ← Shell (nav, sidebar, auth guard) — required for auth groups
    ├── loading.tsx     ← Suspense fallback
    └── error.tsx       ← Error boundary for async routes
```

New route groups require a `layout.tsx` when they share a navigation shell or authentication guard.
