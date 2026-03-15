# `src/shared/errors/`

## Purpose

Provides a **typed application error hierarchy** rooted at `AppError`. Centralising errors here ensures consistent HTTP status codes, machine-readable error codes, and a single integration point for error boundary components and API response serialisers.

## Exports

| Class / Function | HTTP Status | Error Code | Description |
|------------------|:-----------:|-----------|-------------|
| `AppError` | 500 | `INTERNAL_ERROR` | Base class; all application errors extend this |
| `NotFoundError` | 404 | `NOT_FOUND` | Resource could not be found |
| `UnauthorizedError` | 401 | `UNAUTHORIZED` | Caller is not authenticated |
| `ForbiddenError` | 403 | `FORBIDDEN` | Caller lacks permission |
| `ValidationError` | 422 | `VALIDATION_ERROR` | Input validation failed; carries optional `fields` map |
| `ConflictError` | 409 | `CONFLICT` | Conflicting resource already exists |
| `toAppError(err)` | — | — | Narrows `unknown` to `AppError`; re-wraps plain `Error` |

## Usage

```typescript
import { NotFoundError, ValidationError, toAppError } from "@/shared";

// Throw a typed error from a use-case
if (!workspace) throw new NotFoundError("Workspace", workspaceId);

// Catch and normalise unknown errors at API boundaries
try {
  await doSomething();
} catch (err) {
  const appErr = toAppError(err);
  return { ok: false, error: appErr.message, code: appErr.code };
}
```

## Conventions

- All error classes must extend `AppError` (not `Error` directly).
- Assign a unique `UPPER_SNAKE_CASE` error `code` to every subclass.
- Domain-specific errors that only appear within one module should be defined in that module's `domain.*/_value-objects.ts` (e.g., `WorkspaceNotActiveError`), not here.
- Use `toAppError` at all top-level catch sites (Route Handlers, Server Actions) to avoid leaking raw stack traces to clients.
