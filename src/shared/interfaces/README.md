# `src/shared/interfaces/`

## Purpose

Defines **structural TypeScript interfaces** (compile-time-only type contracts) used across the application for API request/response shapes, pagination, Firestore document metadata, and view-layer data contracts. These are type-level definitions — no Zod schemas or runtime validation logic live here (use `src/shared/types/` for that).

## Exports

### API envelope

| Interface | Description |
|-----------|-------------|
| `ApiResponse<T>` | Generic API success/failure envelope (`{ ok, data?, error?, code? }`) |
| `ApiError` | Structured error payload returned by Route Handlers |

### Pagination

| Interface | Description |
|-----------|-------------|
| `PaginationQuery` | Incoming pagination parameters (`page`, `pageSize`, `cursor`) |
| `PaginatedResult<T>` | Outgoing paginated response with `items`, `total`, `hasNextPage`, `nextCursor` |

### Firestore

| Interface | Description |
|-----------|-------------|
| `FirestoreDocument` | Base marker: `id`, `createdAt`, `updatedAt` |

### Drag-and-drop / vis-date (visual indicator date)

| Interface | Description |
|-----------|-------------|
| `VisDateMetadata` | Temporal position (`date`, `endDate`, `sourceDocId`) attached to draggable items |

## Usage

```typescript
import type { ApiResponse, PaginatedResult, FirestoreDocument } from "@/shared";

// Route Handler response
return NextResponse.json<ApiResponse<WorkspaceDTO>>({ ok: true, data: dto });

// Use-case return type
async function listWorkspaces(): Promise<PaginatedResult<WorkspaceDTO>> { … }
```

## Conventions

- Interfaces use `PascalCase` prefixed with `I` only for **port** interfaces (see `ports/`).
- Keep interfaces lean; avoid adding optional fields that are never actually populated.
- When an interface needs runtime validation, create a companion Zod schema in `src/shared/types/` instead of adding `instanceof` checks here.
