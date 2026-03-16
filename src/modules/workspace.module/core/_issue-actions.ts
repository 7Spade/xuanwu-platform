import { FirestoreIssueRepository } from "../infra.firestore/_issue-repository";
import {
  createIssue as createIssueUseCase,
  deleteIssue as deleteIssueUseCase,
  updateIssue as updateIssueUseCase,
  type IssueDTO,
} from "./_issue-use-cases";

const issueRepository = new FirestoreIssueRepository();

export type { IssueDTO };
export type IssueSeverity = "critical" | "high" | "medium" | "low";
export type IssueStatus = "open" | "in-progress" | "resolved" | "closed";

export async function createIssue(
  id: string,
  workspaceId: string,
  title: string,
  severity: IssueSeverity,
  reporterId: string,
  description?: string,
) {
  return createIssueUseCase(issueRepository, id, workspaceId, title, severity, reporterId, description);
}

export async function updateIssue(
  id: string,
  input: { title?: string; description?: string | null; status?: IssueStatus; severity?: IssueSeverity; assigneeId?: string | null },
) {
  return updateIssueUseCase(issueRepository, id, input);
}

export async function deleteIssue(id: string) {
  return deleteIssueUseCase(issueRepository, id);
}
