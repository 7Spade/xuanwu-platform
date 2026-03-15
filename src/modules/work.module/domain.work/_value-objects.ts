import { z } from "zod";

export const WorkItemIdSchema = z.string().min(1);
export type WorkItemId = z.infer<typeof WorkItemIdSchema>;

export const MilestoneIdSchema = z.string().min(1);
export type MilestoneId = z.infer<typeof MilestoneIdSchema>;

export const WorkItemStatusSchema = z.enum([
  "open",
  "in-progress",
  "blocked",
  "closed",
  /** Task work is done; pending QA review. */
  "completed",
  /** Passed QA; pending acceptance sign-off. */
  "verified",
  /** Formally accepted by the client / acceptance gate. */
  "accepted",
]);
export type WorkItemStatus = z.infer<typeof WorkItemStatusSchema>;

export const WorkItemPrioritySchema = z.enum(["low", "medium", "high", "critical"]);
export type WorkItemPriority = z.infer<typeof WorkItemPrioritySchema>;

export const DependencyTypeSchema = z.enum(["blocks", "depends-on"]);
export type DependencyType = z.infer<typeof DependencyTypeSchema>;
