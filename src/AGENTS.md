# `src/` Agent Rules

Purpose: enforce one-way dependency direction and correct layer placement across the entire source tree.

This file is mandatory reading for any agent touching files under `src/`.

---

## 0. Dependency Direction (Non-negotiable)

```
src/app/            → src/modules/ (via public index.ts barrels only)
src/app/            → src/design-system/
src/modules/        → src/shared/
src/modules/        → src/infrastructure/ (via port interfaces only)
src/infrastructure/ → src/shared/
src/design-system/  → src/shared/
src/shared/         → (nothing outside shared)
```

**Red lines — stop and report if any of the following appears:**

1. `src/shared/` imports from `src/modules/`, `src/infrastructure/`, or `src/app/`.
2. `src/infrastructure/` imports from `src/modules/`.
3. `src/modules/<A>.module` imports from `src/modules/<B>.module` internal paths (`core/`, `domain.*`, `infra.*`, `_components/`) — must use `<B>.module/index.ts` barrel only.
4. `src/design-system/` imports from `src/modules/` or `src/infrastructure/`.
5. Firebase or external SDK calls placed directly in `src/app/` routes (must go through module application layer or infrastructure adapter).

---

## 1. Boundary Gate (Run Before Any Edit)

1. Which layer does the target file belong to?
2. Does the edit respect the dependency direction above?
3. If adding a new import, is it from the correct layer or public barrel?
4. Does the change introduce side effects in a layer that must stay pure (`shared/`, domain layer)?
5. Does new UI text use the i18n dictionary in `src/shared/i18n/`?

---

## 2. Layer Placement Checklist

| What you are adding | Where it belongs |
|---------------------|-----------------|
| New route or page | `src/app/` |
| New UI component (reusable) | `src/design-system/` |
| New domain rule or aggregate | `src/modules/<name>.module/domain.*/` |
| New use case / Server Action | `src/modules/<name>.module/core/` |
| New Firebase / Upstash adapter | `src/infrastructure/` or `src/modules/<name>.module/infra.*/` |
| New pure utility / type / error | `src/shared/` |
| New port interface | `src/shared/ports/` (cross-cutting) or module `domain.*/_ports.ts` (module-scoped) |

---

## 3. Cross-Directory Safe Integration Pattern

1. `src/app/` pages call module public APIs: `import { X } from "@/modules/<name>.module"`.
2. Use cases wire port interfaces to concrete adapters at the composition root (Server Action or Route Handler).
3. `src/design-system/` components receive data as props — they must not call use cases or adapters directly.
4. New shared utilities go in `src/shared/` only when used by more than one module.

---

## 4. i18n Rule

Every user-visible string added to `src/app/` or `src/design-system/` MUST have a corresponding key added to **both** `en` and `zh-TW` locale entries in `src/shared/i18n/index.ts`.
