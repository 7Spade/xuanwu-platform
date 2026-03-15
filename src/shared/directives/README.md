# `src/shared/directives/`

## Purpose

Provides **client-side React hooks** that are shared across multiple UI modules. All files in this sub-module carry the `"use client"` directive and are **not server-safe**. They must only be imported from Client Components.

## Exports

| Hook | Signature | Description |
|------|-----------|-------------|
| `useToggle` | `(initial?: boolean) → [boolean, () => void, (v: boolean) => void]` | Boolean on/off toggle with explicit setter |
| `useDebounce` | `<T>(value: T, delay: number) → T` | Debounce a reactive value by `delay` ms |
| `useLocalStorage` | `<T>(key: string, initial: T) → [T, setter]` | Persist state in `localStorage` with JSON serialisation |
| `usePrevious` | `<T>(value: T) → T \| undefined` | Track the previous render value of a variable |
| `useIsMounted` | `() → boolean` | Returns `true` after first client-side mount (avoids hydration mismatch) |

## Usage

```typescript
// ✅ Correct — import directly from the sub-path, NOT from @/shared
import { useToggle, useDebounce } from "@/shared/directives";

// ❌ Wrong — @/shared/index.ts does NOT re-export directives
import { useToggle } from "@/shared";
```

> **Why the separate import?**  
> The `"use client"` directive on `directives/index.ts` would contaminate the `@/shared` barrel if it were re-exported, making it impossible to import `@/shared` inside Server Components or Server Actions.

## Conventions

- Keep hooks small and single-purpose.
- Do not import from `src/modules/` inside this sub-module.
- When a hook needs domain-specific data (e.g., workspace state), it belongs in `src/modules/{module}/_components/use-{feature}.ts` instead.
