# `src/shared/directives/` — DEPRECATED

## ⚠️ Deprecated

This directory has been superseded by `src/shared/hooks/`.

Please import from `@/shared/hooks` instead:

```typescript
import { useToggle, useDebounce, useLocale } from "@/shared/hooks";
```

## Backward Compatibility

This directory still re-exports all hooks for backward compatibility. Existing code will continue to work, but new code should use `@/shared/hooks`.


- Keep hooks small and single-purpose.
- Do not import from `src/modules/` inside this sub-module.
- When a hook needs domain-specific data (e.g., workspace state), it belongs in `src/modules/{module}/_components/use-{feature}.ts` instead.
