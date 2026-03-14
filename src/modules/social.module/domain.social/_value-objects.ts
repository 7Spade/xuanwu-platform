import { z } from "zod";
export const SocialRelationTypeSchema = z.enum(["star", "watch", "follow"]);
export type SocialRelationType = z.infer<typeof SocialRelationTypeSchema>;
