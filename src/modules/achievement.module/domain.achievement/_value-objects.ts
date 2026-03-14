import { z } from "zod";
export const AchievementIdSchema = z.string().min(1);
export type AchievementId = z.infer<typeof AchievementIdSchema>;
export const BadgeSlugSchema = z.string().min(1).regex(/^[a-z0-9-]+$/);
export type BadgeSlug = z.infer<typeof BadgeSlugSchema>;
