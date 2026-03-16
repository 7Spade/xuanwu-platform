# `src/shared/hooks/` — Shared React Hooks

## Purpose

Reusable React hooks for common patterns: state management, localStorage persistence, performance optimization, and lifecycle utilities.

These hooks implement cross-cutting contracts (like `ILocalePort` and `IAuthPort`) for client components outside the module structure.

## Key Hooks

- **`useToggle`** — Binary state with toggle function
- **`useDebounce`** — Delay value updates (search, resize handlers)
- **`useLocalStorage`** — Persist state to localStorage
- **`usePrevious`** — Track previous render value
- **`useIsMounted`** — Detect client-side hydration
- **`useLocale`** — i18n locale persistence (implements `ILocalePort`)
- **`useAuthState`** — Firebase Auth observation (implements `IAuthPort`)

## Import Pattern

```typescript
import { useToggle, useDebounce, useLocale } from "@/shared/hooks";
```

Do **not** import from individual files; all hooks are barrel-exported via `index.ts`.
