// work.module — Public API barrel
// Bounded Context: Work Items · Milestones / 工作項目 · 里程碑
export type { WorkItemDTO } from "./core/_queries";
export type { WorkItemStatus, WorkItemPriority } from "./domain.work/_value-objects";
export {
  createWorkItem,
  updateWorkItem,
  updateWorkItemStatus,
  deleteWorkItem,
  createChildWorkItem,
  reportProgress,
} from "./core/_actions";
export { getWorkItemsByWorkspace } from "./core/_queries";
export type { UpdateWorkItemInput } from "./core/_actions";
export type { IWorkItemRepository, IMilestoneRepository } from "./domain.work/_ports";
export type { TaskWithChildren } from "./domain.work/_task-tree";
export { buildTaskTree } from "./domain.work/_task-tree";
