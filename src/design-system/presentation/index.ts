/**
 * Presentation Layer — Drag-and-Drop & Visual Indicators
 *
 * This tier holds all Presentation-layer components and hooks that are
 * tightly coupled to drag-and-drop interactions and their visual feedback
 * elements (Visual Indicators / VIs).
 *
 * Libraries:
 *   @atlaskit/pragmatic-drag-and-drop                  — core DnD engine
 *   @atlaskit/pragmatic-drag-and-drop-hitbox            — edge/center hitboxes
 *   @atlaskit/pragmatic-drag-and-drop-react-drop-indicator — VI components
 *
 * Rules:
 *   - All components and hooks here are Client Components (`"use client"`).
 *   - No business logic — only drag state, drop targets, and visual feedback.
 *   - vis-date metadata is passed as immutable props from Server Actions;
 *     this layer NEVER fetches from Firestore directly.
 *
 * vis-date + Firebase collaboration:
 *   The `VisDateMetadata` interface (defined in `@/shared/interfaces`) carries
 *   the temporal position of a draggable item resolved from Firestore.
 *   Server Actions fetch and cache these values via `cacheAside` and pass
 *   them as serialised props. The Presentation layer reads these props to
 *   render drop-indicator positions on a timeline or calendar without making
 *   any additional DB calls.
 *
 * @example
 * // Server Action (resolves vis-date from Firestore via cache)
 * import { cacheAside }      from "@/infrastructure/firebase/functions/db/cacheLayer";
 * import type { VisDateMetadata } from "@/shared/interfaces";
 *
 * // Client Component (renders DnD with VI at correct date position)
 * import { DraggableItem, DropZone, DateDropIndicator } from "@/design-system/presentation";
 */

// ---------------------------------------------------------------------------
// When @atlaskit/pragmatic-drag-and-drop is installed, export DnD primitives
// and VI wrappers from this barrel.
//
// Example exports (uncomment after installing the library):
//
// export { DraggableItem }    from "./DraggableItem";
// export { DropZone }         from "./DropZone";
// export { DateDropIndicator } from "./DateDropIndicator";
// ---------------------------------------------------------------------------

export {};
