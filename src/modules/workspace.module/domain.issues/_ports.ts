import type { IssueEntity } from "./_entity";
import type { IssueId } from "./_entity";

export interface IIssueRepository {
  findById(id: IssueId): Promise<IssueEntity | null>;
  findByWorkspaceId(workspaceId: string): Promise<IssueEntity[]>;
  save(issue: IssueEntity): Promise<void>;
  deleteById(id: IssueId): Promise<void>;
}
