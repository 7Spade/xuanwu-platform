/**
 * Achievement mapper — Firestore document ↔ AchievementRecord transformation.
 *
 * Keeps all Firestore-specific field names and null-coercions in one place,
 * so the domain layer never has to know about Firestore's wire format.
 */

import type { AchievementRecord } from "../domain.achievement/_entity";
import type { AchievementId, BadgeSlug } from "../domain.achievement/_value-objects";

// ---------------------------------------------------------------------------
// Firestore document shape (raw, unvalidated)
// ---------------------------------------------------------------------------

/** Raw Firestore document shape for an AchievementRecord. */
export interface AchievementDoc {
  id: string;
  accountId: string;
  badgeSlug: string;
  unlockedAt: string;
}

// ---------------------------------------------------------------------------
// Firestore → Domain
// ---------------------------------------------------------------------------

/**
 * Maps a raw Firestore AchievementDoc to a typed AchievementRecord.
 */
export function achievementDocToRecord(d: AchievementDoc): AchievementRecord {
  return {
    id: d.id as AchievementId,
    accountId: d.accountId,
    badgeSlug: d.badgeSlug as BadgeSlug,
    unlockedAt: d.unlockedAt,
  };
}

// ---------------------------------------------------------------------------
// Domain → Firestore
// ---------------------------------------------------------------------------

/**
 * Maps an AchievementRecord to a plain object suitable for Firestore write.
 */
export function achievementRecordToDoc(e: AchievementRecord): AchievementDoc {
  return {
    id: e.id,
    accountId: e.accountId,
    badgeSlug: e.badgeSlug,
    unlockedAt: e.unlockedAt,
  };
}
