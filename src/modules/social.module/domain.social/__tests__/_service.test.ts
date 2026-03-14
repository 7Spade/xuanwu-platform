import { describe, it, expect } from "vitest";
import {
  hasRelation,
  getRelationsByType,
  getFollowerIds,
  getFollowingIds,
  scoreDiscoveryCandidate,
  rankDiscoveryCandidates,
  type DiscoveryCandidate,
} from "../_service";
import type { SocialRelation } from "../_entity";

function makeRelation(
  subjectAccountId: string,
  targetId: string,
  relationType: SocialRelation["relationType"] = "follow",
  targetType: SocialRelation["targetType"] = "account",
): SocialRelation {
  return { id: `${subjectAccountId}-${targetId}`, subjectAccountId, targetId, targetType, relationType, createdAt: "2024-01-01T00:00:00Z" };
}

// ---------------------------------------------------------------------------
// hasRelation
// ---------------------------------------------------------------------------

describe("hasRelation", () => {
  it("returns true when relation exists", () => {
    const relations = [makeRelation("alice", "bob", "follow")];
    expect(hasRelation(relations, "alice", "bob", "follow")).toBe(true);
  });

  it("returns false when relation does not exist", () => {
    const relations = [makeRelation("alice", "bob", "follow")];
    expect(hasRelation(relations, "alice", "bob", "star")).toBe(false);
  });

  it("returns false for empty list", () => {
    expect(hasRelation([], "alice", "bob", "follow")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getRelationsByType
// ---------------------------------------------------------------------------

describe("getRelationsByType", () => {
  it("filters to the requested type", () => {
    const relations = [
      makeRelation("alice", "bob", "follow"),
      makeRelation("alice", "ws-1", "star", "workspace"),
    ];
    expect(getRelationsByType(relations, "follow")).toHaveLength(1);
    expect(getRelationsByType(relations, "star")).toHaveLength(1);
  });

  it("returns empty for no matching type", () => {
    expect(getRelationsByType([], "watch")).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// getFollowerIds / getFollowingIds
// ---------------------------------------------------------------------------

describe("getFollowerIds", () => {
  it("returns ids of accounts following the target", () => {
    const relations = [
      makeRelation("alice", "charlie", "follow"),
      makeRelation("bob", "charlie", "follow"),
    ];
    const followers = getFollowerIds(relations, "charlie");
    expect(followers).toContain("alice");
    expect(followers).toContain("bob");
  });

  it("returns empty when no followers", () => {
    expect(getFollowerIds([], "charlie")).toHaveLength(0);
  });
});

describe("getFollowingIds", () => {
  it("returns target ids that subject follows", () => {
    const relations = [
      makeRelation("alice", "bob", "follow"),
      makeRelation("alice", "charlie", "follow"),
    ];
    const following = getFollowingIds(relations, "alice");
    expect(following).toContain("bob");
    expect(following).toContain("charlie");
  });
});

// ---------------------------------------------------------------------------
// scoreDiscoveryCandidate / rankDiscoveryCandidates
// ---------------------------------------------------------------------------

describe("scoreDiscoveryCandidate", () => {
  it("returns a positive score for a valid candidate", () => {
    const now = new Date().toISOString();
    const candidate: DiscoveryCandidate = {
      targetId: "bob",
      followerCount: 100,
      lastActivityAt: now,
    };
    const score = scoreDiscoveryCandidate(candidate, now);
    expect(score).toBeGreaterThan(0);
  });

  it("gives a higher score to a candidate with more followers", () => {
    const now = new Date().toISOString();
    const scoreA = scoreDiscoveryCandidate({ targetId: "a", followerCount: 1000, lastActivityAt: now }, now);
    const scoreB = scoreDiscoveryCandidate({ targetId: "b", followerCount: 10, lastActivityAt: now }, now);
    expect(scoreA).toBeGreaterThan(scoreB);
  });
});

describe("rankDiscoveryCandidates", () => {
  it("returns top-N candidates sorted by score descending", () => {
    const now = new Date().toISOString();
    const candidates: DiscoveryCandidate[] = [
      { targetId: "low", followerCount: 1, lastActivityAt: now },
      { targetId: "high", followerCount: 10000, lastActivityAt: now },
      { targetId: "mid", followerCount: 100, lastActivityAt: now },
    ];
    const ranked = rankDiscoveryCandidates(candidates, now, 2);
    expect(ranked).toHaveLength(2);
    expect(ranked[0]!.targetId).toBe("high");
  });

  it("returns all when n exceeds candidate count", () => {
    const now = new Date().toISOString();
    const candidates: DiscoveryCandidate[] = [{ targetId: "a", followerCount: 1, lastActivityAt: now }];
    expect(rankDiscoveryCandidates(candidates, now, 10)).toHaveLength(1);
  });
});
