import { z } from "zod";

// ---------------------------------------------------------------------------
// ScheduleId
// ---------------------------------------------------------------------------

export const ScheduleIdSchema = z.string().min(1, "ScheduleId must not be empty");
export type ScheduleId = z.infer<typeof ScheduleIdSchema>;

// ---------------------------------------------------------------------------
// ScheduleStatus
// ---------------------------------------------------------------------------

export const ScheduleStatusSchema = z.enum([
  "PROPOSAL",
  "OFFICIAL",
  "REJECTED",
  "COMPLETED",
]);
export type ScheduleStatus = z.infer<typeof ScheduleStatusSchema>;

// ---------------------------------------------------------------------------
// ScheduleOriginType
// ---------------------------------------------------------------------------

export const ScheduleOriginTypeSchema = z.enum(["MANUAL", "TASK_AUTOMATION"]);
export type ScheduleOriginType = z.infer<typeof ScheduleOriginTypeSchema>;

// ---------------------------------------------------------------------------
// EffortUnit
// ---------------------------------------------------------------------------

export const EffortUnitSchema = z.enum(["hours", "days", "units"]);
export type EffortUnit = z.infer<typeof EffortUnitSchema>;

// ---------------------------------------------------------------------------
// AssignmentStatus
// ---------------------------------------------------------------------------

export const AssignmentStatusSchema = z.enum([
  "pending",
  "accepted",
  "declined",
  "completed",
]);
export type AssignmentStatus = z.infer<typeof AssignmentStatusSchema>;

// ---------------------------------------------------------------------------
// SkillRequirement (workforce-scoped)
// ---------------------------------------------------------------------------

/** Minimum skill requirement attached to a schedule item (from WBS task). */
export interface SkillRequirement {
  readonly skillSlug: string;
  readonly minTier: string;
}
