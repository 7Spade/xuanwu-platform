import { z } from "zod";
export const SocialRelationTypeSchema = z.enum(["star", "watch", "follow", "like", "bookmark"]);
export type SocialRelationType = z.infer<typeof SocialRelationTypeSchema>;

export const SocialTargetTypeSchema = z.enum(["workspace", "account", "daily-log", "issue"]);
export type SocialTargetType = z.infer<typeof SocialTargetTypeSchema>;
