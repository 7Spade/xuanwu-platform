# `src/shared/utils/`

## Purpose

Provides **pure helper functions** for common operations (date formatting, string manipulation, array/object utilities). All functions here are stateless, side-effect-free, and safe to use in any context (server, client, tests, Storybook).

## Exports

### Date helpers

| Function | Signature | Description |
|----------|-----------|-------------|
| `formatDate(date, locale?)` | `(Date, string?) → string` | Locale-aware date string (uses `Intl.DateTimeFormat`) |
| `formatDateTime(date, locale?)` | `(Date, string?) → string` | Locale-aware date+time string |

### String helpers

| Function | Signature | Description |
|----------|-----------|-------------|
| `capitalise(str)` | `(string) → string` | Uppercase first letter (British English spelling — intentional project convention) |
| `toKebabCase(str)` | `(string) → string` | Convert camelCase/PascalCase to kebab-case |

### Object helpers

| Function | Signature | Description |
|----------|-----------|-------------|
| `omit(obj, keys)` | `(T, K[]) → Omit<T, K>` | Return a copy without the specified keys |
| `pick(obj, keys)` | `(T, K[]) → Pick<T, K>` | Return a copy with only the specified keys |

### Array helpers

| Function | Signature | Description |
|----------|-----------|-------------|
| `unique(arr)` | `(T[]) → T[]` | Remove duplicates via strict equality |
| `chunk(arr, size)` | `(T[], number) → T[][]` | Split into sub-arrays of `size` |

## Usage

```typescript
import { formatDate, capitalise, omit, chunk } from "@/shared";

const label = capitalise(workspace.name);
const display = formatDate(new Date(createdAt));
const safe = omit(dto, ["internalId"]);
const pages = chunk(items, 20);
```

## Conventions

- All functions must be **pure** (no side effects, no mutation of arguments).
- Do not add functions that depend on React, Next.js, Firebase, or any framework — those belong in the respective infrastructure or module layer.
- Prefer the built-in `Intl` API for date/number formatting over third-party libraries.
- When a helper grows complex enough to require its own tests, consider promoting it to its own file within this sub-module.
