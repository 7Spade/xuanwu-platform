import type { AchievementId, BadgeSlug } from "./_value-objects";

/** An unlocked badge for a specific account. */
export interface AchievementRecord {
  readonly id: AchievementId;
  readonly accountId: string;
  readonly badgeSlug: BadgeSlug;
  readonly unlockedAt: string; // ISO-8601
}

export function buildAchievementRecord(
  id: AchievementId, accountId: string, badgeSlug: BadgeSlug, now: string,
): AchievementRecord {
  return { id, accountId, badgeSlug, unlockedAt: now };
}
