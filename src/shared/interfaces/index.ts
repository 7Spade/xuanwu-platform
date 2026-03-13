/**
 * API Request / Response contracts.
 *
 * These interfaces are shared between the frontend (Client Components,
 * Server Actions) and backend (Route Handlers) to keep request / response
 * shapes in sync.
 *
 * Prefer Zod schemas in `@/shared/types` for runtime validation.
 * These interfaces are for TypeScript-level structural contracts.
 */

// ---------------------------------------------------------------------------
// Generic API envelope
// ---------------------------------------------------------------------------

export interface ApiResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
  code?: string;
}

export interface ApiError {
  message: string;
  code: string;
  statusCode: number;
}

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

export interface PaginationQuery {
  page?: number;
  pageSize?: number;
  cursor?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
  nextCursor?: string;
}

// ---------------------------------------------------------------------------
// Firebase Firestore document base
// ---------------------------------------------------------------------------

/** Marker interface for Firestore document data. */
export interface FirestoreDocument {
  id: string;
  createdAt: string | null;
  updatedAt: string | null;
}

// ---------------------------------------------------------------------------
// vis-date / DnD data contracts
//
// Visual Indicator date data (vis-date) represents the temporal position
// associated with a draggable item when rendered in a timeline or calendar
// view.
//
// Firebase collaboration: vis-date values are typically resolved by fetching
// a domain aggregate's date field from Firestore via a Server Action, then
// passed as immutable DnD item metadata so the Presentation layer can render
// the correct drop-indicator position without additional DB round-trips.
//
// Architecture:
//   Firestore (source of truth)
//     └→ Server Action (cacheAside read)
//         └→ serialised to Client as vis-date props
//             └→ Presentation layer renders DropIndicator at the correct date position
// ---------------------------------------------------------------------------

/** Temporal position metadata attached to a draggable item. */
export interface VisDateMetadata {
  /** ISO-8601 date string representing the item's current date position. */
  date: string;
  /** Optional end date for range-based draggable items. */
  endDate?: string;
  /** The Firestore document ID that owns this date value. */
  sourceDocId: string;
}
