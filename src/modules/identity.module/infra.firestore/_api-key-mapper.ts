/**
 * API Key mapper — Firestore document ↔ ApiKeyRecord transformation.
 *
 * Keeps all Firestore-specific field names and null-coercions in one place,
 * so the domain layer never has to know about Firestore's wire format.
 */

import type { ApiKeyRecord } from "../domain.identity/_api-key-entity";
import type { ApiKeyId } from "../domain.identity/_value-objects";

// ---------------------------------------------------------------------------
// Firestore document shape (raw, unvalidated)
// ---------------------------------------------------------------------------

/** Raw Firestore document shape for an ApiKeyRecord. */
export interface ApiKeyDoc {
  id: string;
  namespaceSlug: string;
  name: string;
  keyPreview: string;
  createdAt: string;
  expiresAt: string | null;
  lastUsedAt: string | null;
  isActive: boolean;
}

// ---------------------------------------------------------------------------
// Firestore → Domain
// ---------------------------------------------------------------------------

/**
 * Maps a raw Firestore ApiKeyDoc to a typed ApiKeyRecord.
 */
export function apiKeyDocToRecord(d: ApiKeyDoc): ApiKeyRecord {
  return {
    id: d.id as ApiKeyId,
    namespaceSlug: d.namespaceSlug,
    name: d.name,
    keyPreview: d.keyPreview,
    createdAt: d.createdAt,
    expiresAt: d.expiresAt ?? null,
    lastUsedAt: d.lastUsedAt ?? null,
    isActive: d.isActive,
  };
}

// ---------------------------------------------------------------------------
// Domain → Firestore
// ---------------------------------------------------------------------------

/**
 * Maps an ApiKeyRecord to a plain object suitable for Firestore write.
 */
export function apiKeyRecordToDoc(e: ApiKeyRecord): ApiKeyDoc {
  return {
    id: e.id,
    namespaceSlug: e.namespaceSlug,
    name: e.name,
    keyPreview: e.keyPreview,
    createdAt: e.createdAt,
    expiresAt: e.expiresAt,
    lastUsedAt: e.lastUsedAt,
    isActive: e.isActive,
  };
}
