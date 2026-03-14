import { describe, it, expect } from "vitest";
import {
  sagaTierIndex,
  SAGA_TIER_ORDER,
  findEligibleCandidate,
  isCapacitySufficient,
  detectScheduleConflicts,
  canTransitionScheduleStatus,
  VALID_STATUS_TRANSITIONS,
  type EligibleMemberSnapshot,
} from "../_service";
import type { ScheduleAssignment } from "../_entity";
import type { SkillRequirement, ScheduleStatus, ScheduleId } from "../_value-objects";

function makeSnapshot(
  accountId: string,
  eligible = true,
  skills: Array<{ skillSlug: string; tier: string }> = [],
): EligibleMemberSnapshot {
  return { accountId, eligible, skills };
}

function makeSchedule(
  id: string,
  assigneeIds: string[],
  startDate: string,
  endDate: string,
  status: ScheduleStatus = "PROPOSAL",
): ScheduleAssignment {
  return {
    id: id as ScheduleId,
    accountId: "acc-org",
    workspaceId: "ws-1",
    title: `Schedule ${id}`,
    assigneeIds,
    status,
    originType: "MANUAL",
    version: 0,
    startDate,
    endDate,
    createdAt: "2024-01-01T00:00:00Z",
  };
}

// ---------------------------------------------------------------------------
// sagaTierIndex
// ---------------------------------------------------------------------------

describe("sagaTierIndex", () => {
  it("returns 0 for apprentice (first tier)", () => {
    expect(sagaTierIndex("apprentice")).toBe(0);
  });

  it("returns last index for titan", () => {
    expect(sagaTierIndex("titan")).toBe(SAGA_TIER_ORDER.length - 1);
  });

  it("returns 0 for unknown tier (degraded gracefully)", () => {
    expect(sagaTierIndex("unknown-tier")).toBe(0);
  });

  it("SAGA_TIER_ORDER has expected tiers", () => {
    expect(SAGA_TIER_ORDER).toContain("journeyman");
    expect(SAGA_TIER_ORDER).toContain("expert");
    expect(SAGA_TIER_ORDER).toContain("grandmaster");
  });
});

// ---------------------------------------------------------------------------
// findEligibleCandidate
// ---------------------------------------------------------------------------

describe("findEligibleCandidate", () => {
  it("returns first eligible candidate when no skill requirements", () => {
    const candidates = [makeSnapshot("acc-1"), makeSnapshot("acc-2")];
    const result = findEligibleCandidate(candidates, []);
    expect(result?.accountId).toBe("acc-1");
  });

  it("skips ineligible candidates", () => {
    const candidates = [makeSnapshot("acc-1", false), makeSnapshot("acc-2", true)];
    const result = findEligibleCandidate(candidates, []);
    expect(result?.accountId).toBe("acc-2");
  });

  it("matches candidate with required skill tier", () => {
    const req: SkillRequirement = { skillSlug: "typescript", minTier: "expert" };
    const candidates = [
      makeSnapshot("acc-1", true, [{ skillSlug: "typescript", tier: "apprentice" }]),
      makeSnapshot("acc-2", true, [{ skillSlug: "typescript", tier: "expert" }]),
    ];
    const result = findEligibleCandidate(candidates, [req]);
    expect(result?.accountId).toBe("acc-2");
  });

  it("returns undefined when no candidates qualify", () => {
    const req: SkillRequirement = { skillSlug: "typescript", minTier: "titan" };
    const candidates = [makeSnapshot("acc-1", true, [{ skillSlug: "typescript", tier: "apprentice" }])];
    expect(findEligibleCandidate(candidates, [req])).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// isCapacitySufficient
// ---------------------------------------------------------------------------

describe("isCapacitySufficient", () => {
  it("returns true when no OFFICIAL schedules overlap", () => {
    // 0 active schedules in range, memberCount=3 → sufficient
    const result = isCapacitySufficient([], 3, "2024-01-10", "2024-01-20");
    expect(result).toBe(true);
  });

  it("returns true when active count <= memberCount", () => {
    const schedules = [
      makeSchedule("s1", ["acc-1"], "2024-01-10", "2024-01-20", "OFFICIAL"),
      makeSchedule("s2", ["acc-2"], "2024-01-10", "2024-01-20", "OFFICIAL"),
    ];
    expect(isCapacitySufficient(schedules, 3, "2024-01-10", "2024-01-20")).toBe(true);
  });

  it("returns false when active count > memberCount", () => {
    const schedules = [
      makeSchedule("s1", ["acc-1"], "2024-01-10", "2024-01-20", "OFFICIAL"),
      makeSchedule("s2", ["acc-2"], "2024-01-10", "2024-01-20", "OFFICIAL"),
      makeSchedule("s3", ["acc-3"], "2024-01-10", "2024-01-20", "OFFICIAL"),
    ];
    expect(isCapacitySufficient(schedules, 2, "2024-01-10", "2024-01-20")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// detectScheduleConflicts
// ---------------------------------------------------------------------------

describe("detectScheduleConflicts", () => {
  it("returns no conflicts for non-overlapping OFFICIAL schedules", () => {
    const schedules = [
      makeSchedule("s1", ["acc-1"], "2024-01-01", "2024-01-05", "OFFICIAL"),
      makeSchedule("s2", ["acc-1"], "2024-01-10", "2024-01-15", "OFFICIAL"),
    ];
    expect(detectScheduleConflicts(schedules)).toHaveLength(0);
  });

  it("detects overlapping OFFICIAL schedules for same assignee", () => {
    const schedules = [
      makeSchedule("s1", ["acc-1"], "2024-01-01", "2024-01-10", "OFFICIAL"),
      makeSchedule("s2", ["acc-1"], "2024-01-05", "2024-01-15", "OFFICIAL"),
    ];
    expect(detectScheduleConflicts(schedules)).toHaveLength(1);
  });

  it("does not flag PROPOSAL schedules as conflicts", () => {
    const schedules = [
      makeSchedule("s1", ["acc-1"], "2024-01-01", "2024-01-10", "PROPOSAL"),
      makeSchedule("s2", ["acc-1"], "2024-01-05", "2024-01-15", "PROPOSAL"),
    ];
    expect(detectScheduleConflicts(schedules)).toHaveLength(0);
  });

  it("does not flag overlaps between different assignees", () => {
    const schedules = [
      makeSchedule("s1", ["acc-1"], "2024-01-01", "2024-01-10", "OFFICIAL"),
      makeSchedule("s2", ["acc-2"], "2024-01-05", "2024-01-15", "OFFICIAL"),
    ];
    expect(detectScheduleConflicts(schedules)).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// canTransitionScheduleStatus
// ---------------------------------------------------------------------------

describe("canTransitionScheduleStatus", () => {
  it("allows PROPOSAL → OFFICIAL", () => {
    expect(canTransitionScheduleStatus("PROPOSAL", "OFFICIAL")).toBe(true);
  });

  it("allows OFFICIAL → COMPLETED", () => {
    expect(canTransitionScheduleStatus("OFFICIAL", "COMPLETED")).toBe(true);
  });

  it("rejects COMPLETED → PROPOSAL (terminal state)", () => {
    expect(canTransitionScheduleStatus("COMPLETED", "PROPOSAL")).toBe(false);
  });

  it("VALID_STATUS_TRANSITIONS has PROPOSAL as a non-empty starting point", () => {
    expect(VALID_STATUS_TRANSITIONS["PROPOSAL"]).not.toHaveLength(0);
  });
});
