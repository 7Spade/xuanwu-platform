# `src/shared/types/`

## Purpose

Provides **Zod-backed value-object schemas**, primitive type aliases, and the `Result<T, E>` monad used throughout the application. Using Zod schemas as the single source of truth for both TypeScript types and runtime validation ensures that shape and validation logic never diverge.

## Exports

### Primitive value objects (Zod schemas + TypeScript types)

| Export | Zod schema | Description |
|--------|-----------|-------------|
| `NonEmptyString` | `z.string().min(1)` | String that must not be empty |
| `UuidSchema` | `z.string().uuid()` | UUID v4 |
| `IsoDateString` | `z.string().datetime()` | ISO-8601 datetime string |
| `PositiveInt` | `z.number().int().positive()` | Positive integer |
| `PaginationSchema` | `z.object({…})` | `{ page, pageSize }` with defaults |
| `Pagination` | `z.infer<typeof PaginationSchema>` | TypeScript type for pagination input |
| `PaginatedResponseSchema(itemSchema)` | factory | Wraps item schema in a paginated envelope |
| `PaginatedResponse<T>` | type | TypeScript type for paginated response |

### Locale

| Export | Description |
|--------|-------------|
| `LocaleSchema` | `z.enum(SUPPORTED_LOCALES)` — validates locale strings at runtime |
| `Locale` | `"zh-TW" \| "en"` |

### Result monad

| Export | Description |
|--------|-------------|
| `Success<T>` | `{ ok: true; value: T }` |
| `Failure<E>` | `{ ok: false; error: E }` |
| `Result<T, E>` | Union of `Success<T>` and `Failure<E>` |
| `ok(value)` | Constructs a `Success<T>` |
| `fail(error)` | Constructs a `Failure<E>` |

## Usage

```typescript
import { UuidSchema, PaginationSchema, ok, fail, type Result } from "@/shared";
import type { Locale } from "@/shared";

// Validate UUID at a boundary
const id = UuidSchema.parse(rawId);

// Use-case returning a Result
function findUser(id: string): Result<UserDTO, NotFoundError> {
  const user = db.find(id);
  if (!user) return fail(new NotFoundError("User", id));
  return ok(toDTO(user));
}
```

## Conventions

- Prefer `Result<T, E>` over throwing in use-cases; throw only in Presentation-layer error boundaries.
- All Zod schemas are named in `PascalCase`; their inferred types use the same name without "Schema".
- Do not add domain-specific schemas here (e.g. `WorkspaceSchema`) — those belong in the Domain Module's `domain.*/_value-objects.ts`.
