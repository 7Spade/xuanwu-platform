import { describe, it, expect } from "vitest";
import {
  clampXp,
  resolveSkillTier,
  hasBadge,
  getBadgesByAccountId,
  isEligibleForBadge,
  evaluateAchievementRules,
  XP_MAX,
  XP_MIN,
} from "../_service";
import type { AchievementRecord } from "../_entity";

function makeRecord(badgeSlug: string, accountId = "acc-1"): AchievementRecord {
  return {
    id: `ar-${badgeSlug}`,
    accountId,
    badgeSlug: badgeSlug as AchievementRecord["badgeSlug"],
    unlockedAt: "2024-01-01T00:00:00Z",
  };
}

// ---------------------------------------------------------------------------
// clampXp
// ---------------------------------------------------------------------------

describe("clampXp", () => {
  it("clamps negative values to XP_MIN", () => {
    expect(clampXp(-10)).toBe(XP_MIN);
  });

  it("clamps excessive values to XP_MAX", () => {
    expect(clampXp(9999)).toBe(XP_MAX);
  });

  it("returns value unchanged when within bounds", () => {
    expect(clampXp(200)).toBe(200);
  });

  it("returns XP_MIN at lower boundary", () => {
    expect(clampXp(XP_MIN)).toBe(XP_MIN);
  });

  it("returns XP_MAX at upper boundary", () => {
    expect(clampXp(XP_MAX)).toBe(XP_MAX);
  });
});

// ---------------------------------------------------------------------------
// resolveSkillTier
// ---------------------------------------------------------------------------

describe("resolveSkillTier", () => {
  it("resolves apprentice for 0 XP", () => {
    expect(resolveSkillTier(0)).toBe("apprentice");
  });

  it("resolves journeyman for 75 XP", () => {
    expect(resolveSkillTier(75)).toBe("journeyman");
  });

  it("resolves titan for max XP", () => {
    expect(resolveSkillTier(XP_MAX)).toBe("titan");
  });

  it("resolves expert for 150 XP", () => {
    expect(resolveSkillTier(150)).toBe("expert");
  });

  it("resolves artisan for 225 XP", () => {
    expect(resolveSkillTier(225)).toBe("artisan");
  });

  it("clamps out-of-range XP before resolving", () => {
    expect(resolveSkillTier(-100)).toBe("apprentice");
    expect(resolveSkillTier(9999)).toBe("titan");
  });
});

// ---------------------------------------------------------------------------
// hasBadge
// ---------------------------------------------------------------------------

describe("hasBadge", () => {
  it("returns true when badge is present", () => {
    const records = [makeRecord("first-commit")];
    expect(hasBadge(records, "first-commit" as AchievementRecord["badgeSlug"])).toBe(true);
  });

  it("returns false when badge is absent", () => {
    const records = [makeRecord("first-commit")];
    expect(hasBadge(records, "centurion" as AchievementRecord["badgeSlug"])).toBe(false);
  });

  it("returns false for empty records", () => {
    expect(hasBadge([], "any-badge" as AchievementRecord["badgeSlug"])).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getBadgesByAccountId
// ---------------------------------------------------------------------------

describe("getBadgesByAccountId", () => {
  it("returns unique badge slugs", () => {
    const records = [makeRecord("first-commit"), makeRecord("first-commit"), makeRecord("centurion")];
    const badges = getBadgesByAccountId(records);
    expect(badges).toHaveLength(2);
    expect(badges).toContain("first-commit");
    expect(badges).toContain("centurion");
  });

  it("returns empty array for no records", () => {
    expect(getBadgesByAccountId([])).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// isEligibleForBadge
// ---------------------------------------------------------------------------

describe("isEligibleForBadge", () => {
  it("returns true when badge not yet earned", () => {
    expect(isEligibleForBadge([], "centurion" as AchievementRecord["badgeSlug"])).toBe(true);
  });

  it("returns false when badge already earned", () => {
    const records = [makeRecord("centurion")];
    expect(isEligibleForBadge(records, "centurion" as AchievementRecord["badgeSlug"])).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// evaluateAchievementRules
// ---------------------------------------------------------------------------

describe("evaluateAchievementRules", () => {
  it("grants badge when not already held", () => {
    const result = evaluateAchievementRules([], "centurion" as AchievementRecord["badgeSlug"]);
    expect(result).toEqual(["centurion"]);
  });

  it("does not grant badge already held (idempotent)", () => {
    const result = evaluateAchievementRules(
      ["centurion" as AchievementRecord["badgeSlug"]],
      "centurion" as AchievementRecord["badgeSlug"],
    );
    expect(result).toEqual([]);
  });
});
