import { ok, fail } from "@/shared";
import type { Result } from "@/shared";
import type { ScheduleAssignment } from "../domain.workforce/_entity";
import { buildScheduleProposal } from "../domain.workforce/_entity";
import type { ScheduleId, ScheduleStatus } from "../domain.workforce/_value-objects";
import type { IScheduleRepository } from "../domain.workforce/_ports";

// ---------------------------------------------------------------------------
// DTOs
// ---------------------------------------------------------------------------

export interface ScheduleDTO {
  readonly id: string;
  readonly accountId: string;
  readonly workspaceId: string;
  readonly title: string;
  readonly status: ScheduleStatus;
  readonly assigneeIds: readonly string[];
  readonly startDate: string;
  readonly endDate: string;
  readonly createdAt: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function entityToDTO(s: ScheduleAssignment): ScheduleDTO {
  return {
    id: s.id,
    accountId: s.accountId,
    workspaceId: s.workspaceId,
    title: s.title,
    status: s.status,
    assigneeIds: s.assigneeIds,
    startDate: s.startDate,
    endDate: s.endDate,
    createdAt: s.createdAt,
  };
}

// ---------------------------------------------------------------------------
// Use Cases
// ---------------------------------------------------------------------------

export async function proposeSchedule(
  repo: IScheduleRepository,
  id: string,
  accountId: string,
  workspaceId: string,
  title: string,
  assigneeIds: string[],
  startDate: string,
  endDate: string,
  proposedBy: string,
): Promise<Result<ScheduleDTO>> {
  try {
    const now = new Date().toISOString();
    const schedule = buildScheduleProposal(
      id as ScheduleId,
      accountId,
      workspaceId,
      title,
      assigneeIds,
      startDate,
      endDate,
      proposedBy,
      now,
    );
    await repo.save(schedule);
    return ok(entityToDTO(schedule));
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

export async function approveSchedule(
  repo: IScheduleRepository,
  id: string,
): Promise<Result<ScheduleDTO>> {
  try {
    const existing = await repo.findById(id as ScheduleId);
    if (!existing) return fail(new Error(`Schedule not found: ${id}`));
    if (existing.status !== "PROPOSAL") {
      return fail(new Error(`Can only approve PROPOSAL schedules, got: ${existing.status}`));
    }
    const updated: ScheduleAssignment = {
      ...existing,
      status: "OFFICIAL",
      version: existing.version + 1,
      updatedAt: new Date().toISOString(),
    };
    await repo.save(updated);
    return ok(entityToDTO(updated));
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

export async function rejectSchedule(
  repo: IScheduleRepository,
  id: string,
): Promise<Result<ScheduleDTO>> {
  try {
    const existing = await repo.findById(id as ScheduleId);
    if (!existing) return fail(new Error(`Schedule not found: ${id}`));
    if (existing.status !== "PROPOSAL") {
      return fail(new Error(`Can only reject PROPOSAL schedules, got: ${existing.status}`));
    }
    const updated: ScheduleAssignment = {
      ...existing,
      status: "REJECTED",
      version: existing.version + 1,
      updatedAt: new Date().toISOString(),
    };
    await repo.save(updated);
    return ok(entityToDTO(updated));
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

export async function getSchedulesByWorkspace(
  repo: IScheduleRepository,
  workspaceId: string,
): Promise<Result<ScheduleDTO[]>> {
  try {
    const schedules = await repo.findByWorkspaceId(workspaceId);
    return ok(schedules.map(entityToDTO));
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

export async function getSchedulesByAssignee(
  repo: IScheduleRepository,
  assigneeId: string,
): Promise<Result<ScheduleDTO[]>> {
  try {
    const schedules = await repo.findByAssigneeId(assigneeId);
    return ok(schedules.map(entityToDTO));
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}
