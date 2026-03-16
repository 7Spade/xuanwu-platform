import { FirestoreDailyLogRepository } from "../infra.firestore/_daily-log-repository";
import {
  getDailyLogs as getDailyLogsUseCase,
  type DailyLogDTO,
} from "./_daily-log-use-cases";

const dailyLogRepository = new FirestoreDailyLogRepository();

export type { DailyLogDTO };

export async function getDailyLogs(workspaceId: string) {
  return getDailyLogsUseCase(dailyLogRepository, workspaceId);
}
