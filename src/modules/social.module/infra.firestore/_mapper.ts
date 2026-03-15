/**
 * Social mapper — Firestore document ↔ SocialRelation transformation.
 *
 * Keeps all Firestore-specific field names and null-coercions in one place,
 * so the domain layer never has to know about Firestore's wire format.
 */

import type { SocialRelation } from "../domain.social/_entity";
import type { SocialRelationType, SocialTargetType } from "../domain.social/_value-objects";
import { SocialTargetTypeSchema } from "../domain.social/_value-objects";

// ---------------------------------------------------------------------------
// Firestore document shape (raw, unvalidated)
// ---------------------------------------------------------------------------

/** Raw Firestore document shape for a SocialRelation. */
export interface SocialRelationDoc {
  id: string;
  subjectAccountId: string;
  targetId: string;
  targetType: string;
  relationType: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Firestore → Domain
// ---------------------------------------------------------------------------

/**
 * Maps a raw Firestore SocialRelationDoc to a typed SocialRelation.
 */
export function socialRelationDocToEntity(d: SocialRelationDoc): SocialRelation {
  // Validate targetType with Zod, fall back to "account" for unknown legacy values
  const targetTypeParsed = SocialTargetTypeSchema.safeParse(d.targetType);
  return {
    id: d.id,
    subjectAccountId: d.subjectAccountId,
    targetId: d.targetId,
    targetType: targetTypeParsed.success ? targetTypeParsed.data : "account",
    relationType: d.relationType as SocialRelationType,
    createdAt: d.createdAt,
  };
}

// ---------------------------------------------------------------------------
// Domain → Firestore
// ---------------------------------------------------------------------------

/**
 * Maps a SocialRelation to a plain object suitable for Firestore write.
 */
export function socialRelationEntityToDoc(e: SocialRelation): SocialRelationDoc {
  return {
    id: e.id,
    subjectAccountId: e.subjectAccountId,
    targetId: e.targetId,
    targetType: e.targetType,
    relationType: e.relationType,
    createdAt: e.createdAt,
  };
}
