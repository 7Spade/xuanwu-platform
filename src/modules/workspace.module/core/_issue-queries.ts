import { FirestoreIssueRepository } from "../infra.firestore/_issue-repository";
import {
  getIssues as getIssuesUseCase,
  type IssueDTO,
} from "./_issue-use-cases";

const issueRepository = new FirestoreIssueRepository();

export type { IssueDTO };
export type IssueSeverity = "critical" | "high" | "medium" | "low";
export type IssueStatus = "open" | "in-progress" | "resolved" | "closed";

export async function getIssues(workspaceId: string) {
  return getIssuesUseCase(issueRepository, workspaceId);
}
