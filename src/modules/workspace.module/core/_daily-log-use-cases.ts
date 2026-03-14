import { ok, fail } from "@/shared";
import type { Result } from "@/shared";
import type { IDailyLogRepository } from "../domain.daily/_ports";
import type { DailyLogEntity } from "../domain.daily/_entity";
import { buildDailyLog } from "../domain.daily/_entity";
import type { DailyLogId } from "../domain.daily/_entity";

export interface DailyLogDTO {
  readonly id: string;
  readonly workspaceId: string;
  readonly date: string;
  readonly content: string;
  readonly photoURLs: readonly string[];
  readonly authorId: string;
  readonly createdAt: string;
}

function toDTO(e: DailyLogEntity): DailyLogDTO {
  return {
    id: e.id,
    workspaceId: e.workspaceId,
    date: e.date,
    content: e.content,
    photoURLs: e.photoURLs,
    authorId: e.authorId,
    createdAt: e.createdAt,
  };
}

export async function getDailyLogs(
  repo: IDailyLogRepository,
  workspaceId: string,
): Promise<Result<DailyLogDTO[]>> {
  try {
    const logs = await repo.findByWorkspaceId(workspaceId);
    return ok(logs.map(toDTO));
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

export async function createDailyLog(
  repo: IDailyLogRepository,
  id: string,
  workspaceId: string,
  date: string,
  content: string,
  photoURLs: string[],
  authorId: string,
): Promise<Result<DailyLogDTO>> {
  try {
    const now = new Date().toISOString();
    const log = buildDailyLog(id as DailyLogId, workspaceId, date, content, photoURLs, authorId, now);
    await repo.save(log);
    return ok(toDTO(log));
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

export async function updateDailyLog(
  repo: IDailyLogRepository,
  id: string,
  content: string,
  photoURLs: string[],
): Promise<Result<DailyLogDTO>> {
  try {
    const existing = await repo.findById(id as DailyLogId);
    if (!existing) return fail(new Error(`DailyLog not found: ${id}`));
    const updated: DailyLogEntity = {
      ...existing,
      content,
      photoURLs,
      updatedAt: new Date().toISOString(),
    };
    await repo.save(updated);
    return ok(toDTO(updated));
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

export async function deleteDailyLog(
  repo: IDailyLogRepository,
  id: string,
): Promise<Result<void>> {
  try {
    await repo.deleteById(id as DailyLogId);
    return ok(undefined);
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}
