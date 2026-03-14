import { ok, fail } from "@/shared";
import type { Result } from "@/shared";
import type { IIssueRepository } from "../domain.issues/_ports";
import type { IssueEntity } from "../domain.issues/_entity";
import { buildIssue } from "../domain.issues/_entity";
import type { IssueId, IssueStatus, IssueSeverity } from "../domain.issues/_entity";

export interface IssueDTO {
  readonly id: string;
  readonly workspaceId: string;
  readonly title: string;
  readonly description?: string;
  readonly status: IssueStatus;
  readonly severity: IssueSeverity;
  readonly reporterId: string;
  readonly assigneeId?: string;
  readonly resolvedAt?: string;
  readonly createdAt: string;
}

function toDTO(e: IssueEntity): IssueDTO {
  return {
    id: e.id,
    workspaceId: e.workspaceId,
    title: e.title,
    description: e.description,
    status: e.status,
    severity: e.severity,
    reporterId: e.reporterId,
    assigneeId: e.assigneeId,
    resolvedAt: e.resolvedAt,
    createdAt: e.createdAt,
  };
}

export async function getIssues(
  repo: IIssueRepository,
  workspaceId: string,
): Promise<Result<IssueDTO[]>> {
  try {
    const issues = await repo.findByWorkspaceId(workspaceId);
    return ok(issues.map(toDTO));
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

export async function createIssue(
  repo: IIssueRepository,
  id: string,
  workspaceId: string,
  title: string,
  severity: IssueSeverity,
  reporterId: string,
  description?: string,
): Promise<Result<IssueDTO>> {
  try {
    const now = new Date().toISOString();
    const issue = buildIssue(id as IssueId, workspaceId, title, severity, reporterId, now);
    const withDesc: IssueEntity = description ? { ...issue, description } : issue;
    await repo.save(withDesc);
    return ok(toDTO(withDesc));
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

export async function updateIssue(
  repo: IIssueRepository,
  id: string,
  input: { title?: string; description?: string | null; status?: IssueStatus; severity?: IssueSeverity; assigneeId?: string | null },
): Promise<Result<IssueDTO>> {
  try {
    const existing = await repo.findById(id as IssueId);
    if (!existing) return fail(new Error(`Issue not found: ${id}`));
    const now = new Date().toISOString();
    const updated: IssueEntity = {
      ...existing,
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.description !== undefined
        ? input.description === null ? { description: undefined } : { description: input.description }
        : {}),
      ...(input.status !== undefined ? {
        status: input.status,
        ...(input.status === "resolved" && !existing.resolvedAt ? { resolvedAt: now } : {}),
      } : {}),
      ...(input.severity !== undefined ? { severity: input.severity } : {}),
      ...(input.assigneeId !== undefined
        ? input.assigneeId === null ? { assigneeId: undefined } : { assigneeId: input.assigneeId }
        : {}),
      updatedAt: now,
    };
    await repo.save(updated);
    return ok(toDTO(updated));
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

export async function deleteIssue(
  repo: IIssueRepository,
  id: string,
): Promise<Result<void>> {
  try {
    await repo.deleteById(id as IssueId);
    return ok(undefined);
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}
