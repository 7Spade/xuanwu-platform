import type { AchievementRecord } from "./_entity";
import type { AchievementId } from "./_value-objects";
export interface IAchievementRepository {
  findByAccountId(accountId: string): Promise<AchievementRecord[]>;
  findById(id: AchievementId): Promise<AchievementRecord | null>;
  save(record: AchievementRecord): Promise<void>;
}
