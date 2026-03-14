import { z } from "zod";
export const CommentIdSchema = z.string().min(1);
export type CommentId = z.infer<typeof CommentIdSchema>;
export const ReactionTypeSchema = z.enum(["like", "heart", "celebrate", "eyes", "rocket"]);
export type ReactionType = z.infer<typeof ReactionTypeSchema>;
