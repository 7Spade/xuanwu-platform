import { z } from "zod";
export const ForkIdSchema = z.string().min(1);
export type ForkId = z.infer<typeof ForkIdSchema>;
export const ForkStatusSchema = z.enum(["active", "merged", "abandoned"]);
export type ForkStatus = z.infer<typeof ForkStatusSchema>;
