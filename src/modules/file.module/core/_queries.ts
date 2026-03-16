import { FirestoreFileRepository } from "../infra.firestore/_repository";
import { getFilesByWorkspace as getFilesByWorkspaceUseCase, type FileDTO } from "./_use-cases";

const fileRepository = new FirestoreFileRepository();

export type { FileDTO };

export async function getFilesByWorkspace(workspaceId: string) {
  return getFilesByWorkspaceUseCase(fileRepository, workspaceId);
}
