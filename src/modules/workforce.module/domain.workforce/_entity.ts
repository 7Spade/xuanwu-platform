import type {
  ScheduleId,
  ScheduleStatus,
  ScheduleOriginType,
  SkillRequirement,
} from "./_value-objects";

// ---------------------------------------------------------------------------
// ScheduleLocation
// ---------------------------------------------------------------------------

export interface ScheduleLocation {
  readonly building?: string;
  readonly floor?: string;
  readonly room?: string;
  readonly description: string;
}

// ---------------------------------------------------------------------------
// ScheduleAssignment — aggregate root
// ---------------------------------------------------------------------------

/**
 * The ScheduleAssignment aggregate root.
 *
 * Invariants:
 *   - A schedule must have at least one assignee to be OFFICIAL.
 *   - Start date must be before end date.
 *   - Only PROPOSAL schedules can be approved or rejected.
 *   - OFFICIAL schedules can be COMPLETED but not re-opened.
 */
export interface ScheduleAssignment {
  readonly id: ScheduleId;
  readonly accountId: string;       // org account owning this assignment
  readonly workspaceId: string;
  readonly workspaceName?: string;
  readonly title: string;
  readonly description?: string;
  readonly status: ScheduleStatus;
  readonly originType: ScheduleOriginType;
  /** ID of the WBS task this schedule was auto-generated from (when TASK_AUTOMATION). */
  readonly originTaskId?: string;
  readonly assigneeIds: readonly string[];
  readonly location?: ScheduleLocation;
  /** Sub-location ID within the workspace. */
  readonly locationId?: string;
  readonly requiredSkills?: readonly SkillRequirement[];
  readonly proposedBy?: string;
  /** Monotonic version counter for optimistic concurrency. */
  readonly version: number;
  readonly startDate: string;   // ISO-8601
  readonly endDate: string;     // ISO-8601
  readonly createdAt: string;   // ISO-8601
  readonly updatedAt?: string;  // ISO-8601
}

// ---------------------------------------------------------------------------
// Factory helpers
// ---------------------------------------------------------------------------

export function buildScheduleProposal(
  id: ScheduleId,
  accountId: string,
  workspaceId: string,
  title: string,
  assigneeIds: string[],
  startDate: string,
  endDate: string,
  proposedBy: string,
  now: string,
): ScheduleAssignment {
  return {
    id,
    accountId,
    workspaceId,
    title,
    status: "PROPOSAL",
    originType: "MANUAL",
    assigneeIds,
    proposedBy,
    version: 0,
    startDate,
    endDate,
    createdAt: now,
  };
}
