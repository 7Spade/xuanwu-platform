# `src/design-system/` — UI Component Library

## Purpose

`src/design-system/` is the **shared UI component library and design token system** for Xuanwu Platform. It provides a five-tier hierarchy of reusable, domain-agnostic components that are consumed by `src/app/` pages and module `_components/`.

This directory has **no knowledge of domain logic** — it is purely presentational.

## Five-Tier Hierarchy

```
src/design-system/
├── primitives/   ← Raw shadcn/ui components (Button, Input, Dialog, …)
├── components/   ← Project-specific composite components (SearchField, …)
├── patterns/     ← Higher-order UI composites (LoginForm, …)
├── layout/       ← Structural layout shells and page-specific wrappers
│   ├── base/     ← Generic base layouts
│   └── marketing/← Marketing page layouts
├── tokens/       ← Design-token constants (colours, spacing, typography)
└── providers/    ← React context providers (ThemeProvider, …)
```

Import from the most specific tier available:

```typescript
import { Button }        from "@/design-system/primitives";   // raw primitive
import { SearchField }   from "@/design-system/components";   // composite component
import { LoginForm }     from "@/design-system/patterns";     // higher-order pattern
import { HomeLayout }    from "@/design-system/layout/marketing";
import { colorBrand }    from "@/design-system/tokens";       // design token
```

Or import from the top-level barrel (all tiers re-exported):

```typescript
import { Button, SearchField, colorBrand } from "@/design-system";
```

## Tier Responsibilities

| Tier | Location | Purpose |
|------|----------|---------|
| `primitives/` | `primitives/ui/` | shadcn/ui base components; extend but do not modify internals |
| `components/` | `components/` | Project-specific wrappers and composed primitives |
| `patterns/` | `patterns/` | Multi-step or form-level UI composites (reuse across features) |
| `layout/` | `layout/` | Page-level structural shells (nav, sidebar, page container) |
| `tokens/` | `tokens/` | Design-token constants consumed by Tailwind and components |
| `providers/` | `providers/` | React context providers (theme, locale); not re-exported from barrel |

## Coding Conventions

- **Server Components by default** — add `"use client"` only when event handlers, refs, or browser APIs are required.
- **Shadcn/ui foundation** — extend shadcn/ui components via the `cn()` utility and `class-variance-authority` variants; do not modify files in `primitives/ui/` directly — re-export with extensions instead.
- **Tailwind CSS** — use utility classes; avoid inline `style` props unless for dynamic values that cannot be expressed as utilities.
- **No domain logic** — components receive all data as props or via React context; they must not call use cases, Server Actions, or infrastructure adapters.
- **No module imports** — this directory must not import from `src/modules/` or `src/infrastructure/`.
- **Named exports only** — avoid default exports to keep tree-shaking and refactoring predictable.

## Import Rules

```typescript
// ✅ Correct — import from shared for utilities
import { cn } from "@/shared/utils";

// ❌ Wrong — design system must not depend on domain modules
import { useWorkspace } from "@/modules/workspace.module";

// ❌ Wrong — design system must not depend on infrastructure
import { redis } from "@/infrastructure/upstash";
```

## See Also

- App routes: [`src/app/README.md`](../app/README.md)
- Shared utilities: [`src/shared/README.md`](../shared/README.md)
