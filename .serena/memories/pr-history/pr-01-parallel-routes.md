# PR #1 — feat: implement parallel routes across /src/app/ per Next.js canary spec

**Status**: Merged (2026-03-13)
**Branch**: (merged to main)

## Summary
Added `@sidebar` named slots to the three authenticated layout boundaries following Next.js parallel route conventions.

## Key Changes
- Added `@sidebar/default.tsx` (returns `null`) to three layout boundaries:
  - `(main)/(account)/`
  - `(main)/[slug]/`
  - `(main)/[slug]/[workspaceId]/(workspace)/`
- Added `default.tsx` at each boundary (children implicit-slot fallback, prevents 404 on hard navigation)

## Structure added (per boundary)
```
/
├── layout.tsx        # receives { children, sidebar: React.ReactNode }
├── default.tsx       # children implicit-slot fallback — prevents 404 on hard nav
└── @sidebar/
    └── default.tsx   # named-slot fallback — returns null (no active subpage)
```

## Architecture Rationale
- `@sidebar/default.tsx` must return `null` — canary docs specify this as canonical fallback for inactive named slots
- Returning visible markup would inject content on every route since no `page.tsx` exists inside the slot
- Layout receives `sidebar` as `React.ReactNode` prop (typed in the `layout.tsx` function signature)

## Lessons learned
- Parallel routes require BOTH a `default.tsx` at the root AND a `default.tsx` inside each `@slot/` folder
- Returning visible markup from `@slot/default.tsx` is a common mistake (shows on all routes)
