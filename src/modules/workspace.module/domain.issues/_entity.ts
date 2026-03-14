import { z } from "zod";

export const IssueIdSchema = z.string().min(1);
export type IssueId = z.infer<typeof IssueIdSchema>;

export const IssueStatusSchema = z.enum(["open", "in-progress", "resolved", "closed"]);
export type IssueStatus = z.infer<typeof IssueStatusSchema>;

export const IssueSeveritySchema = z.enum(["low", "medium", "high", "critical"]);
export type IssueSeverity = z.infer<typeof IssueSeveritySchema>;

/** Issue entity for workspace issue tracking. */
export interface IssueEntity {
  readonly id: IssueId;
  readonly workspaceId: string;
  readonly title: string;
  readonly description?: string;
  readonly status: IssueStatus;
  readonly severity: IssueSeverity;
  readonly reporterId: string;
  readonly assigneeId?: string;
  readonly resolvedAt?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export function buildIssue(
  id: IssueId,
  workspaceId: string,
  title: string,
  severity: IssueSeverity,
  reporterId: string,
  now: string,
): IssueEntity {
  return {
    id, workspaceId, title, severity, reporterId,
    status: "open",
    createdAt: now, updatedAt: now,
  };
}
