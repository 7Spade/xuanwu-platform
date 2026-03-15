import { z } from "zod";

export const DailyLogIdSchema = z.string().min(1);
export type DailyLogId = z.infer<typeof DailyLogIdSchema>;

/** Daily log entry for a workspace. */
export interface DailyLogEntity {
  readonly id: DailyLogId;
  readonly workspaceId: string;
  readonly date: string; // ISO-8601 date (YYYY-MM-DD)
  readonly content: string;
  readonly photoURLs: readonly string[];
  readonly authorId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export function buildDailyLog(
  id: DailyLogId,
  workspaceId: string,
  date: string,
  content: string,
  photoURLs: string[],
  authorId: string,
  now: string,
): DailyLogEntity {
  return {
    id, workspaceId, date, content,
    photoURLs, authorId,
    createdAt: now, updatedAt: now,
  };
}
