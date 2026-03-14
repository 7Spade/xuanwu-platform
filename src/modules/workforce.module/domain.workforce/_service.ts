/**
 * Workforce domain services — pure, side-effect-free logic spanning workforce aggregates.
 *
 * All functions are synchronous and infrastructure-independent.
 *
 * Adapted from 7Spade/xuanwu workforce-scheduling.slice/domain.core/eligibility/index.ts
 * and domain.core/rules/schedule.rules.ts.
 */

import type { ScheduleAssignment } from "./_entity";
import type { ScheduleStatus, SkillRequirement } from "./_value-objects";

// ---------------------------------------------------------------------------
// Eligibility types — OrgEligibleMemberView snapshot
// ---------------------------------------------------------------------------

/** A member's skill entry for eligibility evaluation. */
export interface EligibleMemberSkill {
  readonly skillSlug: string;
  readonly tier: string;
}

/**
 * Minimal projection of an org member used for eligibility checks.
 * Sourced from a read-model / projection; never from the Account aggregate directly.
 */
export interface EligibleMemberSnapshot {
  readonly accountId: string;
  /** False when the member has conflicting active assignments. */
  readonly eligible: boolean;
  readonly skills: EligibleMemberSkill[];
}

/** A single assignment decision: one eligible member fulfils one requirement slot. */
export interface CandidateAssignment {
  readonly candidate: EligibleMemberSnapshot;
  /** The requirement this candidate was selected to fulfil. Null when no skill filter applies. */
  readonly requirement: SkillRequirement | null;
}

// ---------------------------------------------------------------------------
// Tier ordering
// ---------------------------------------------------------------------------

/** Canonical tier ordering from lowest to highest. */
export const SAGA_TIER_ORDER = [
  "apprentice",
  "journeyman",
  "expert",
  "artisan",
  "grandmaster",
  "legendary",
  "titan",
] as const;

export type SagaTier = (typeof SAGA_TIER_ORDER)[number];

/**
 * Returns the 0-based ordinal index of a tier string within SAGA_TIER_ORDER.
 * Unknown tier values default to 0 (apprentice rank) with a warning.
 */
export function sagaTierIndex(tier: string): number {
  const idx = SAGA_TIER_ORDER.indexOf(tier as SagaTier);
  if (idx === -1) {
    console.warn(
      `[workforce:eligibility] Unknown tier "${tier}", defaulting to 0 (apprentice). Valid tiers: ${SAGA_TIER_ORDER.join(", ")}`,
    );
    return 0;
  }
  return idx;
}

// ---------------------------------------------------------------------------
// Single-candidate eligibility (simple assignment)
// ---------------------------------------------------------------------------

/**
 * Returns the first EligibleMemberSnapshot that satisfies ALL skill requirements.
 *
 * Returns undefined if no qualifying candidate exists — the caller should trigger
 * saga compensation.
 *
 * @param members      Eligible member snapshots from the read-model projection
 * @param requirements Skill requirements from the schedule proposal
 */
export function findEligibleCandidate(
  members: EligibleMemberSnapshot[],
  requirements: SkillRequirement[],
): EligibleMemberSnapshot | undefined {
  return members.find((member) => {
    if (!member.eligible) return false;
    return requirements.every((req) => {
      const skill = member.skills.find((s) => s.skillSlug === req.skillSlug);
      if (!skill) return false;
      return sagaTierIndex(skill.tier) >= sagaTierIndex(req.minTier);
    });
  });
}

// ---------------------------------------------------------------------------
// Multi-candidate eligibility (multi-slot assignment)
// ---------------------------------------------------------------------------

/**
 * Finds eligible members to fulfil ALL skill requirements, respecting `quantity`.
 *
 * For each SkillRequirement with `quantity: N`, selects N distinct eligible members
 * that satisfy the requirement. A member can only be selected once across all
 * requirements (no double-counting).
 *
 * Empty requirements → returns one eligible member (backward-compatible single-assignment).
 *
 * Returns undefined if any requirement cannot be fully satisfied — caller must trigger
 * saga compensation.
 *
 * @param members      Eligible member snapshots from the read-model projection
 * @param requirements Skill requirements from the schedule proposal
 */
export function findEligibleCandidatesForRequirements(
  members: EligibleMemberSnapshot[],
  requirements: SkillRequirement[],
): CandidateAssignment[] | undefined {
  // Empty requirements: assign one eligible member (backward-compatible)
  if (requirements.length === 0) {
    const first = members.find((m) => m.eligible);
    if (!first) return undefined;
    return [{ candidate: first, requirement: null }];
  }

  const assignedIds = new Set<string>();
  const assignments: CandidateAssignment[] = [];

  for (const req of requirements) {
    let assignedForReq = 0;
    const needed = req.quantity ?? 1;

    for (const member of members) {
      if (assignedForReq >= needed) break;
      if (!member.eligible) continue;
      if (assignedIds.has(member.accountId)) continue;

      const skill = member.skills.find((s) => s.skillSlug === req.skillSlug);
      if (!skill) continue;
      if (sagaTierIndex(skill.tier) < sagaTierIndex(req.minTier)) continue;

      assignedIds.add(member.accountId);
      assignments.push({ candidate: member, requirement: req });
      assignedForReq++;
    }

    if (assignedForReq < needed) {
      // Cannot fulfil this requirement — caller must compensate
      return undefined;
    }
  }

  return assignments;
}

// ---------------------------------------------------------------------------
// CapacityAllocationService — schedule capacity check
// ---------------------------------------------------------------------------

/**
 * Returns true if the number of OFFICIAL schedules for the given workspace
 * does not exceed the available member pool capacity.
 *
 * Capacity = total eligible members; load = OFFICIAL assignments whose date
 * range overlaps the query window [startDate, endDate].
 *
 * @param schedules      All ScheduleAssignments for the workspace
 * @param memberCount    Total eligible member count available in the date range
 * @param startDate      ISO-8601 window start
 * @param endDate        ISO-8601 window end
 */
export function isCapacitySufficient(
  schedules: readonly ScheduleAssignment[],
  memberCount: number,
  startDate: string,
  endDate: string,
): boolean {
  const activeCount = schedules.filter((s) => {
    if (s.status !== "OFFICIAL") return false;
    // Overlap check: schedule overlaps [startDate, endDate]
    return s.startDate <= endDate && s.endDate >= startDate;
  }).length;
  return activeCount <= memberCount;
}

// ---------------------------------------------------------------------------
// ScheduleConflictResolutionService — temporal overlap detection
// ---------------------------------------------------------------------------

/** A conflict report between two overlapping OFFICIAL schedule assignments. */
export interface ScheduleConflict {
  readonly assigneeId: string;
  readonly scheduleAId: string;
  readonly scheduleBId: string;
  readonly overlapStart: string;
  readonly overlapEnd: string;
}

/**
 * Detects temporal overlaps between OFFICIAL ScheduleAssignments for the same
 * assignee. Proposals are excluded — they may overlap until confirmed OFFICIAL.
 *
 * Returns an array of conflict reports; empty if no conflicts exist.
 *
 * @param schedules All ScheduleAssignments to scan (e.g. for one workspace / org)
 */
export function detectScheduleConflicts(
  schedules: readonly ScheduleAssignment[],
): ScheduleConflict[] {
  const official = schedules.filter((s) => s.status === "OFFICIAL");
  const conflicts: ScheduleConflict[] = [];

  for (let i = 0; i < official.length; i++) {
    for (let j = i + 1; j < official.length; j++) {
      const a = official[i];
      const b = official[j];

      // Check each assignee of a against each assignee of b
      for (const assigneeId of a.assigneeIds) {
        if (!b.assigneeIds.includes(assigneeId)) continue;

        // Temporal overlap check
        const overlapStart =
          a.startDate > b.startDate ? a.startDate : b.startDate;
        const overlapEnd = a.endDate < b.endDate ? a.endDate : b.endDate;
        if (overlapStart <= overlapEnd) {
          conflicts.push({
            assigneeId,
            scheduleAId: a.id,
            scheduleBId: b.id,
            overlapStart,
            overlapEnd,
          });
        }
      }
    }
  }

  return conflicts;
}

// ---------------------------------------------------------------------------
// Schedule status FSM — valid transitions
// ---------------------------------------------------------------------------

/**
 * Defines the allowed status transitions for a ScheduleAssignment.
 * Key: current status → Value: allowed next statuses.
 */
export const VALID_STATUS_TRANSITIONS: Record<ScheduleStatus, ScheduleStatus[]> = {
  PROPOSAL: ["OFFICIAL", "REJECTED"],
  OFFICIAL: ["COMPLETED", "REJECTED"],
  REJECTED: ["PROPOSAL"],
  COMPLETED: [],
};

/**
 * Returns true if transitioning from `from` to `to` is a valid status change.
 */
export function canTransitionScheduleStatus(
  from: ScheduleStatus,
  to: ScheduleStatus,
): boolean {
  return (VALID_STATUS_TRANSITIONS[from] ?? []).includes(to);
}
