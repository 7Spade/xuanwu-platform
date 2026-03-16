import { FirestoreDailyLogRepository } from "../infra.firestore/_daily-log-repository";
import {
  createDailyLog as createDailyLogUseCase,
  deleteDailyLog as deleteDailyLogUseCase,
  updateDailyLog as updateDailyLogUseCase,
  type DailyLogDTO,
} from "./_daily-log-use-cases";

const dailyLogRepository = new FirestoreDailyLogRepository();

export type { DailyLogDTO };

export async function createDailyLog(
  id: string,
  workspaceId: string,
  date: string,
  content: string,
  photoURLs: string[],
  authorId: string,
) {
  return createDailyLogUseCase(dailyLogRepository, id, workspaceId, date, content, photoURLs, authorId);
}

export async function updateDailyLog(id: string, content: string, photoURLs: string[]) {
  return updateDailyLogUseCase(dailyLogRepository, id, content, photoURLs);
}

export async function deleteDailyLog(id: string) {
  return deleteDailyLogUseCase(dailyLogRepository, id);
}
