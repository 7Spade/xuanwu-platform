import type { ScheduleAssignment } from "./_entity";
import type { ScheduleId } from "./_value-objects";

export interface IScheduleRepository {
  findById(id: ScheduleId): Promise<ScheduleAssignment | null>;
  findByWorkspaceId(workspaceId: string): Promise<ScheduleAssignment[]>;
  findByAccountId(accountId: string): Promise<ScheduleAssignment[]>;
  findByAssigneeId(assigneeId: string): Promise<ScheduleAssignment[]>;
  save(schedule: ScheduleAssignment): Promise<void>;
  deleteById(id: ScheduleId): Promise<void>;
}

export interface IEligibilityCheckPort {
  /** Check if a member meets the skill requirements for an assignment. */
  isEligible(memberId: string, requiredSkillSlugs: string[]): Promise<boolean>;
}
