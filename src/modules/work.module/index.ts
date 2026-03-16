// work.module — Public API barrel
// Bounded Context: Work Items · Milestones / 工作項目 · 里程碑
export type { WorkItemDTO } from "./domain.work/_dto";
export type { WorkItemStatus, WorkItemPriority } from "./domain.work/_value-objects";
export {
  createWorkItem,
  updateWorkItem,
  updateWorkItemStatus,
  deleteWorkItem,
  createChildWorkItem,
  reportProgress,
  getWorkItemsByWorkspace,
} from "./core/_use-cases";
export type { UpdateWorkItemInput } from "./core/_use-cases";
export type { IWorkItemRepository, IMilestoneRepository } from "./domain.work/_ports";
export type { TaskWithChildren } from "./domain.work/_task-tree";
export { buildTaskTree } from "./domain.work/_task-tree";
