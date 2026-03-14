import type { DailyLogEntity } from "./_entity";
import type { DailyLogId } from "./_entity";

export interface IDailyLogRepository {
  findById(id: DailyLogId): Promise<DailyLogEntity | null>;
  findByWorkspaceId(workspaceId: string): Promise<DailyLogEntity[]>;
  save(log: DailyLogEntity): Promise<void>;
  deleteById(id: DailyLogId): Promise<void>;
}
