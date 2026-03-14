import type { WorkItemEntity, MilestoneEntity } from "./_entity";
import type { WorkItemId, MilestoneId } from "./_value-objects";

export interface IWorkItemRepository {
  findById(id: WorkItemId): Promise<WorkItemEntity | null>;
  findByWorkspaceId(workspaceId: string): Promise<WorkItemEntity[]>;
  save(item: WorkItemEntity): Promise<void>;
  deleteById(id: WorkItemId): Promise<void>;
}

export interface IMilestoneRepository {
  findById(id: MilestoneId): Promise<MilestoneEntity | null>;
  findByWorkspaceId(workspaceId: string): Promise<MilestoneEntity[]>;
  save(milestone: MilestoneEntity): Promise<void>;
}
