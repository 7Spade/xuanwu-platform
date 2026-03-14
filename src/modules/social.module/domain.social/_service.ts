/**
 * Social domain services.
 *
 * Pure functions — no I/O, no async, no side-effects.
 *
 * SocialGraphQueryService:
 *   - hasRelation — checks whether an exact relation already exists.
 *   - getRelationsByType — filters a list of relations to a specific type.
 *   - getFollowerIds — returns all account IDs that follow a given target.
 *   - getFollowingIds — returns all target IDs that a subject is following.
 *
 * DiscoveryRankingService:
 *   - scoreDiscoveryCandidate — assigns a numeric relevance score to a
 *     potential discovery target based on follower count and recency.
 *   - rankDiscoveryCandidates — sorts a batch of candidates by score
 *     (descending) and returns the top-N slice.
 */

import type { SocialRelation } from "./_entity";
import type { SocialRelationType } from "./_value-objects";

// ---------------------------------------------------------------------------
// SocialGraphQueryService
// ---------------------------------------------------------------------------

/**
 * Returns `true` if `relations` already contains a relation from
 * `subjectAccountId` → `targetId` with type `relationType`.
 */
export function hasRelation(
  relations: readonly SocialRelation[],
  subjectAccountId: string,
  targetId: string,
  relationType: SocialRelationType,
): boolean {
  return relations.some(
    (r) =>
      r.subjectAccountId === subjectAccountId &&
      r.targetId === targetId &&
      r.relationType === relationType,
  );
}

/**
 * Filters a list of relations to only those with the given `relationType`.
 */
export function getRelationsByType(
  relations: readonly SocialRelation[],
  relationType: SocialRelationType,
): SocialRelation[] {
  return relations.filter((r) => r.relationType === relationType);
}

/**
 * Returns all subject account IDs that have a `follow` relation pointing to
 * `targetId` (i.e. the set of followers for that target).
 */
export function getFollowerIds(
  relations: readonly SocialRelation[],
  targetId: string,
): string[] {
  return relations
    .filter((r) => r.targetId === targetId && r.relationType === "follow")
    .map((r) => r.subjectAccountId);
}

/**
 * Returns all target IDs that `subjectAccountId` is following.
 */
export function getFollowingIds(
  relations: readonly SocialRelation[],
  subjectAccountId: string,
): string[] {
  return relations
    .filter(
      (r) => r.subjectAccountId === subjectAccountId && r.relationType === "follow",
    )
    .map((r) => r.targetId);
}

// ---------------------------------------------------------------------------
// DiscoveryRankingService
// ---------------------------------------------------------------------------

/** Input record for a discovery candidate. */
export interface DiscoveryCandidate {
  readonly targetId: string;
  /** Number of accounts that follow this target. */
  readonly followerCount: number;
  /** ISO-8601 timestamp of the most recent relation pointing to this target. */
  readonly lastActivityAt: string;
}

/** A scored discovery candidate ready for UI ranking. */
export interface ScoredCandidate {
  readonly targetId: string;
  readonly score: number;
}

/**
 * Computes a relevance score for a discovery candidate.
 *
 * Score formula:
 *   base = log2(followerCount + 1)                 (logarithmic follower weight)
 *   recencyBoost = max(0, 1 - daysOld / 30)        (linear decay over 30 days)
 *   score = base * (1 + recencyBoost)
 *
 * Pure — does not access any I/O or mutable state.
 */
export function scoreDiscoveryCandidate(
  candidate: DiscoveryCandidate,
  now: string,
): number {
  const followerBase = Math.log2(candidate.followerCount + 1);
  const daysOld =
    (new Date(now).getTime() - new Date(candidate.lastActivityAt).getTime()) /
    (1000 * 60 * 60 * 24);
  const recencyBoost = Math.max(0, 1 - daysOld / 30);
  return followerBase * (1 + recencyBoost);
}

/**
 * Scores and ranks a list of discovery candidates by relevance, returning the
 * top `limit` results (defaults to 20).
 */
export function rankDiscoveryCandidates(
  candidates: readonly DiscoveryCandidate[],
  now: string,
  limit = 20,
): ScoredCandidate[] {
  return candidates
    .map((c) => ({ targetId: c.targetId, score: scoreDiscoveryCandidate(c, now) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
