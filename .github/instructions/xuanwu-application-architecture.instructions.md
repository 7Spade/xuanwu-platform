---
name: "Xuanwu Application Architecture Rules"
description: "Project-specific application rules for Domain Module boundaries, Next.js App Router behavior, and performance-aware implementation."
applyTo: "src/**/*.{ts,tsx,js,jsx,css,md}"
---

# Xuanwu Application Architecture Rules

## Domain Module Architecture

- MUST enforce unidirectional dependency flow and route cross-module imports through public `index.ts` barrels only.
- MUST keep server-side data fetching in module `queries.ts` files and server mutations in `actions.ts` files.
- MUST wrap third-party services behind module adapters instead of calling SDKs directly from UI components.
- MUST colocate tests with their module code and keep module READMEs synchronized with public API or integration changes.

## Next.js App Router

- MUST keep Server Components as default and add `'use client'` only where browser APIs or interactivity require it.
- MUST validate Route Handler and Server Action inputs.
- SHOULD use route-level `loading.tsx`, `error.tsx`, `Suspense`, and cache primitives where they improve correctness and UX.
- MUST consult current official documentation for version-sensitive Next.js behavior.

## Performance

- MUST prioritize hot-path bottlenecks and avoid blocking work in request paths.
- MUST avoid unnecessary re-renders and unstable list keys on the frontend.
- SHOULD batch calls, paginate large payloads, and use explicit cache invalidation strategies.
- MUST monitor performance regressions in critical code paths when making architecture changes.
