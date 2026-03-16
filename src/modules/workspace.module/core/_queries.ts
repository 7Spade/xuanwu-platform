import { FirestoreWorkspaceRepository } from "../infra.firestore/_repository";
import {
  filterVisibleWorkspaces,
  getWorkspaceById as getWorkspaceByIdUseCase,
  getWorkspacesByDimension as getWorkspacesByDimensionUseCase,
  type WorkspaceDTO,
  type WorkspaceGrantDTO,
} from "./_use-cases";

const workspaceRepository = new FirestoreWorkspaceRepository();

export type { WorkspaceDTO, WorkspaceGrantDTO };
export { filterVisibleWorkspaces };

export async function getWorkspaceById(id: string) {
  return getWorkspaceByIdUseCase(workspaceRepository, id);
}

export async function getWorkspacesByDimension(dimensionId: string) {
  return getWorkspacesByDimensionUseCase(workspaceRepository, dimensionId);
}
