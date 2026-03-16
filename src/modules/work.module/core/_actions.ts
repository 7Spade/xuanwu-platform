import type { WorkItemPriority, WorkItemStatus } from "../domain.work/_value-objects";
import { FirestoreWorkItemRepository } from "../infra.firestore/_repository";
import {
  createChildWorkItem as createChildWorkItemUseCase,
  createWorkItem as createWorkItemUseCase,
  deleteWorkItem as deleteWorkItemUseCase,
  reportProgress as reportProgressUseCase,
  updateWorkItem as updateWorkItemUseCase,
  updateWorkItemStatus as updateWorkItemStatusUseCase,
  type UpdateWorkItemInput,
  type WorkItemDTO,
} from "./_use-cases";

const workItemRepository = new FirestoreWorkItemRepository();

export type { UpdateWorkItemInput, WorkItemDTO };

export async function createWorkItem(
  id: string,
  workspaceId: string,
  title: string,
  priority: WorkItemPriority,
) {
  return createWorkItemUseCase(workItemRepository, id, workspaceId, title, priority);
}

export async function createChildWorkItem(
  id: string,
  workspaceId: string,
  parentId: string,
  title: string,
  priority: WorkItemPriority,
) {
  return createChildWorkItemUseCase(
    workItemRepository,
    id,
    workspaceId,
    parentId,
    title,
    priority,
  );
}

export async function updateWorkItemStatus(id: string, newStatus: WorkItemStatus) {
  return updateWorkItemStatusUseCase(workItemRepository, id, newStatus);
}

export async function updateWorkItem(id: string, input: UpdateWorkItemInput) {
  return updateWorkItemUseCase(workItemRepository, id, input);
}

export async function deleteWorkItem(workspaceId: string, workItemId: string) {
  return deleteWorkItemUseCase(workItemRepository, workspaceId, workItemId);
}

export async function reportProgress(workItemId: string, completedQuantity: number) {
  return reportProgressUseCase(workItemRepository, workItemId, completedQuantity);
}
