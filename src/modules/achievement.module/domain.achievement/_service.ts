/**
 * Achievement domain services.
 *
 * Pure functions — no I/O, no async, no side-effects.
 *
 * SkillTierCalculationService:
 *   - TIER_DEFINITIONS — canonical XP thresholds for the 7-tier proficiency scale.
 *   - XP_MAX / XP_MIN — XP boundary constants (0–525).
 *   - resolveSkillTier — derives a SkillTier from raw XP (never stored; always computed).
 *   - clampXp — clamps XP within [XP_MIN, XP_MAX].
 *
 * AchievementEvaluationService:
 *   - hasBadge — checks whether an account has already unlocked a specific badge.
 *   - getBadgesByAccountId — lists all unlocked badge slugs for a given account.
 *   - isEligibleForBadge — true when the account has NOT yet unlocked the badge.
 *
 * BadgeGrantService:
 *   - evaluateAchievementRules — given a set of current badge slugs and a candidate
 *     badge slug, returns the slug in an array if the account is eligible (idempotent).
 *     Used by the application layer to decide whether to persist a new AchievementRecord.
 */

import type { AchievementRecord } from "./_entity";
import type { BadgeSlug } from "./_value-objects";

// ---------------------------------------------------------------------------
// SkillTier type (sourced from shared-kernel; reproduced here so the domain
// layer stays pure and framework-free without a shared-kernel dependency)
// ---------------------------------------------------------------------------

/**
 * Seven-tier proficiency scale.
 * Values are stable identifiers (safe for Firestore storage & AI prompts).
 * Invariant #12: tier is ALWAYS derived on-demand; NEVER persisted to any DB field.
 */
export type SkillTier =
  | "apprentice"
  | "journeyman"
  | "expert"
  | "artisan"
  | "grandmaster"
  | "legendary"
  | "titan";

/** Static metadata for a single tier. */
export interface TierDefinition {
  readonly tier: SkillTier;
  readonly rank: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  readonly label: string;
  readonly minXp: number;
  readonly maxXp: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Maximum XP per skill — matches the Titan tier cap. */
export const XP_MAX = 525;
/** Minimum XP per skill. */
export const XP_MIN = 0;

/**
 * Canonical XP thresholds for the 7-tier proficiency scale.
 * Source: 7Spade/xuanwu shared-kernel/data-contracts/skill-tier.
 */
export const TIER_DEFINITIONS: readonly TierDefinition[] = [
  { tier: "apprentice",  rank: 1, label: "Apprentice",  minXp: 0,   maxXp: 75  },
  { tier: "journeyman",  rank: 2, label: "Journeyman",  minXp: 75,  maxXp: 150 },
  { tier: "expert",      rank: 3, label: "Expert",      minXp: 150, maxXp: 225 },
  { tier: "artisan",     rank: 4, label: "Artisan",     minXp: 225, maxXp: 300 },
  { tier: "grandmaster", rank: 5, label: "Grandmaster", minXp: 300, maxXp: 375 },
  { tier: "legendary",   rank: 6, label: "Legendary",   minXp: 375, maxXp: 450 },
  { tier: "titan",       rank: 7, label: "Titan",       minXp: 450, maxXp: 525 },
] as const;

// ---------------------------------------------------------------------------
// SkillTierCalculationService
// ---------------------------------------------------------------------------

/**
 * Clamps an XP value within [XP_MIN, XP_MAX].
 *
 * @param xp  Raw XP value to clamp.
 */
export function clampXp(xp: number): number {
  return Math.max(XP_MIN, Math.min(XP_MAX, xp));
}

/**
 * Derives the SkillTier from a raw XP value.
 *
 * Invariant #12: tier is NEVER stored — always compute from xp at query time.
 *
 * @param xp  Accumulated XP (will be clamped internally).
 * @returns  The SkillTier corresponding to the given XP.
 */
export function resolveSkillTier(xp: number): SkillTier {
  const clamped = clampXp(xp);
  for (const def of TIER_DEFINITIONS) {
    if (clamped < def.maxXp) return def.tier;
  }
  return "titan";
}

// ---------------------------------------------------------------------------
// AchievementEvaluationService
// ---------------------------------------------------------------------------

/**
 * Returns true when the given account has already unlocked a specific badge.
 *
 * @param records     Pre-loaded AchievementRecords for the account.
 * @param badgeSlug   Slug of the badge to check.
 */
export function hasBadge(
  records: readonly AchievementRecord[],
  badgeSlug: BadgeSlug,
): boolean {
  return records.some((r) => r.badgeSlug === badgeSlug);
}

/**
 * Lists all badge slugs unlocked by the account.
 *
 * @param records  Pre-loaded AchievementRecords for the account.
 * @returns  Array of distinct BadgeSlugs.
 */
export function getBadgesByAccountId(
  records: readonly AchievementRecord[],
): BadgeSlug[] {
  return Array.from(new Set(records.map((r) => r.badgeSlug))) as BadgeSlug[];
}

/**
 * Returns true when the account has NOT yet unlocked the given badge.
 * Used by the application layer as the pre-condition for granting a badge.
 *
 * @param records     Pre-loaded AchievementRecords for the account.
 * @param badgeSlug   Slug of the badge to check.
 */
export function isEligibleForBadge(
  records: readonly AchievementRecord[],
  badgeSlug: BadgeSlug,
): boolean {
  return !hasBadge(records, badgeSlug);
}

// ---------------------------------------------------------------------------
// BadgeGrantService
// ---------------------------------------------------------------------------

/**
 * Evaluates whether a candidate badge should be granted given the current set
 * of already-unlocked badge slugs.
 *
 * Idempotent — returns an empty array if the badge is already present.
 * The application layer is responsible for persisting the AchievementRecord
 * when the returned array is non-empty.
 *
 * @param currentBadgeSlugs  Already-unlocked badge slugs for the account.
 * @param candidateBadgeSlug  The badge being evaluated for grant.
 * @returns  `[candidateBadgeSlug]` if the account is eligible, otherwise `[]`.
 */
export function evaluateAchievementRules(
  currentBadgeSlugs: readonly BadgeSlug[],
  candidateBadgeSlug: BadgeSlug,
): BadgeSlug[] {
  const alreadyHas = currentBadgeSlugs.includes(candidateBadgeSlug);
  return alreadyHas ? [] : [candidateBadgeSlug];
}
