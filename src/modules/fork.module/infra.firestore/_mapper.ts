/**
 * Fork mapper — Firestore document ↔ ForkEntity transformation.
 *
 * Keeps all Firestore-specific field names and null-coercions in one place,
 * so the domain layer never has to know about Firestore's wire format.
 */

import type { ForkEntity } from "../domain.fork/_entity";
import type { ForkId, ForkStatus } from "../domain.fork/_value-objects";

// ---------------------------------------------------------------------------
// Firestore document shape (raw, unvalidated)
// ---------------------------------------------------------------------------

/** Raw Firestore document shape for a ForkEntity. */
export interface ForkDoc {
  id: string;
  originWorkspaceId: string;
  forkedByAccountId: string;
  baselineVersion: string;
  status: string;
  pendingCRId: string | null;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Converters
// ---------------------------------------------------------------------------

export function forkDocToEntity(doc: ForkDoc): ForkEntity {
  return {
    id: doc.id as ForkId,
    originWorkspaceId: doc.originWorkspaceId,
    forkedByAccountId: doc.forkedByAccountId,
    baselineVersion: doc.baselineVersion,
    status: doc.status as ForkStatus,
    pendingCRId: doc.pendingCRId ?? undefined,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export function forkEntityToDoc(entity: ForkEntity): ForkDoc {
  return {
    id: entity.id,
    originWorkspaceId: entity.originWorkspaceId,
    forkedByAccountId: entity.forkedByAccountId,
    baselineVersion: entity.baselineVersion,
    status: entity.status,
    pendingCRId: entity.pendingCRId ?? null,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  };
}
