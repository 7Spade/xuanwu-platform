# `src/design-system/` Agent Rules

Purpose: keep UI components domain-agnostic and enforce the five-tier hierarchy.

This file is mandatory guidance for any agent editing files under `src/design-system/`.

---

## 0. Non-negotiable Principles

1. `src/design-system/` is **pure UI** — no domain logic, no business rules.
2. Components receive all data as **props or React context** — never call use cases or adapters.
3. No imports from `src/modules/` or `src/infrastructure/` are allowed here.
4. Place new components in the correct tier (see hierarchy below).
5. Use `"use client"` only when browser interaction or refs are genuinely required.

---

## 1. Dependency Direction

```
src/design-system/
   ↓  may import from
src/shared/    ← utilities, tokens, i18n (cn, formatDate, …)

src/design-system/ MUST NOT import from:
   src/modules/        ← domain logic lives in modules
   src/infrastructure/ ← I/O adapters are never a UI concern
```

---

## 2. Five-Tier Placement Checklist

Before placing a new component, answer: which tier does it belong to?

| Tier | Rule |
|------|------|
| `primitives/` | Raw shadcn/ui component or a direct CVA extension of one |
| `components/` | Composite of 2+ primitives with project-specific logic |
| `patterns/` | Multi-step UI flow (e.g. multi-field form, wizard step) |
| `layout/` | Full-page structural shell (navigation, sidebar, content area) |
| `tokens/` | Design-token constant — not a component, only a typed value export |

---

## 3. Boundary Gate (Run Before Any Edit)

1. Does this component import from `src/modules/` or `src/infrastructure/`? → **Stop.**
2. Does it contain business invariants or conditional domain logic? → Move to module `_components/`.
3. Is `"use client"` added without browser-specific API usage? → Remove it.
4. Does a new user-visible string use the i18n dictionary? → Add key to **both** `en` and `zh-TW` in `src/shared/i18n/index.ts`.
5. Is the new component placed in the correct tier?

---

## 4. Red Lines (Hard Fail)

Agent must stop and report when any of the following appears:

1. `import ... from "@/modules/..."` in any design-system file.
2. `import ... from "@/infrastructure/..."` in any design-system file.
3. Business rule or invariant enforcement inside a component.
4. Default export (use named exports only).
5. Mutation or data-fetching logic inside a design-system component.
