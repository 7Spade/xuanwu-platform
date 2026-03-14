import { ok, fail } from "@/shared";
import type { Result } from "@/shared";
import { buildAchievementRecord } from "../domain.achievement/_entity";
import type { AchievementId, BadgeSlug } from "../domain.achievement/_value-objects";
import type { IAchievementRepository } from "../domain.achievement/_ports";

export interface AchievementDTO {
  readonly id: string;
  readonly accountId: string;
  readonly badgeSlug: string;
  readonly unlockedAt: string;
}

export async function unlockBadge(
  repo: IAchievementRepository,
  id: string,
  accountId: string,
  badgeSlug: string,
): Promise<Result<AchievementDTO>> {
  try {
    const now = new Date().toISOString();
    const record = buildAchievementRecord(
      id as AchievementId, accountId, badgeSlug as BadgeSlug, now,
    );
    await repo.save(record);
    return ok({ ...record });
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

export async function getAchievementsByAccount(
  repo: IAchievementRepository,
  accountId: string,
): Promise<Result<AchievementDTO[]>> {
  try {
    const records = await repo.findByAccountId(accountId);
    return ok(records.map((r) => ({ ...r })));
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}
