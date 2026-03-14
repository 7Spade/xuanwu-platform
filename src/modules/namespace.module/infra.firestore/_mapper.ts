/**
 * Namespace mapper — Firestore document ↔ NamespaceEntity transformation.
 *
 * Keeps all Firestore-specific field names and null-coercions in one place,
 * so the domain layer never has to know about Firestore's wire format.
 */

import type { NamespaceEntity, WorkspaceBinding } from "../domain.namespace/_entity";
import type { NamespaceId, NamespaceOwnerType, NamespaceSlug } from "../domain.namespace/_value-objects";

// ---------------------------------------------------------------------------
// Firestore document shapes (raw, unvalidated)
// ---------------------------------------------------------------------------

/** Raw Firestore sub-document for a WorkspaceBinding. */
export interface WorkspaceBindingDoc {
  workspaceId: string;
  workspaceSlug: string;
  boundAt: string;
}

/** Raw Firestore document shape for a NamespaceEntity. */
export interface NamespaceDoc {
  id: string;
  slug: string;
  ownerType: string;
  ownerId: string;
  workspaces: WorkspaceBindingDoc[];
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Firestore → Domain
// ---------------------------------------------------------------------------

function workspaceBindingDocToEntity(d: WorkspaceBindingDoc): WorkspaceBinding {
  return {
    workspaceId: d.workspaceId,
    workspaceSlug: d.workspaceSlug,
    boundAt: d.boundAt,
  };
}

/**
 * Maps a raw Firestore NamespaceDoc to a typed NamespaceEntity.
 */
export function namespaceDocToEntity(d: NamespaceDoc): NamespaceEntity {
  return {
    id: d.id as NamespaceId,
    slug: d.slug as NamespaceSlug,
    ownerType: d.ownerType as NamespaceOwnerType,
    ownerId: d.ownerId,
    workspaces: (d.workspaces ?? []).map(workspaceBindingDocToEntity),
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  };
}

// ---------------------------------------------------------------------------
// Domain → Firestore
// ---------------------------------------------------------------------------

function workspaceBindingEntityToDoc(e: WorkspaceBinding): WorkspaceBindingDoc {
  return {
    workspaceId: e.workspaceId,
    workspaceSlug: e.workspaceSlug,
    boundAt: e.boundAt,
  };
}

/**
 * Maps a NamespaceEntity to a plain object suitable for Firestore write.
 */
export function namespaceEntityToDoc(e: NamespaceEntity): NamespaceDoc {
  return {
    id: e.id,
    slug: e.slug,
    ownerType: e.ownerType,
    ownerId: e.ownerId,
    workspaces: [...e.workspaces].map(workspaceBindingEntityToDoc),
    createdAt: e.createdAt,
    updatedAt: e.updatedAt,
  };
}
