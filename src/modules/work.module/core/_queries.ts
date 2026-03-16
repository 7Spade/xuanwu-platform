import { FirestoreWorkItemRepository } from "../infra.firestore/_repository";
import { getWorkItemsByWorkspace as getWorkItemsByWorkspaceUseCase, type WorkItemDTO } from "./_use-cases";

const workItemRepository = new FirestoreWorkItemRepository();

export type { WorkItemDTO };

export async function getWorkItemsByWorkspace(workspaceId: string) {
  return getWorkItemsByWorkspaceUseCase(workItemRepository, workspaceId);
}
