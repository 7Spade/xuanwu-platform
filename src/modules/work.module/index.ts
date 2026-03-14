// work.module — Public API barrel
// Bounded Context: Work Items · Milestones / 工作項目 · 里程碑
export type { WorkItemDTO } from "./core/_use-cases";
export { createWorkItem, updateWorkItemStatus, getWorkItemsByWorkspace } from "./core/_use-cases";
export type { IWorkItemRepository, IMilestoneRepository } from "./domain.work/_ports";
