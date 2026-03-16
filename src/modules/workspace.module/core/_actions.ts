import type { WorkspaceCapability, WorkspaceRole } from "../domain.workspace/_value-objects";
import {
  FirestoreWorkspaceGrantRepository,
  FirestoreWorkspaceRepository,
} from "../infra.firestore/_repository";
import {
  addWorkspaceLocation as addWorkspaceLocationUseCase,
  advanceWorkspaceLifecycle as advanceWorkspaceLifecycleUseCase,
  createWorkspace as createWorkspaceUseCase,
  deleteWorkspace as deleteWorkspaceUseCase,
  grantWorkspaceAccess as grantWorkspaceAccessUseCase,
  mountCapabilities as mountCapabilitiesUseCase,
  removeWorkspaceLocation as removeWorkspaceLocationUseCase,
  revokeWorkspaceAccess as revokeWorkspaceAccessUseCase,
  unmountCapability as unmountCapabilityUseCase,
  updateWorkspaceRole as updateWorkspaceRoleUseCase,
  updateWorkspaceSettings as updateWorkspaceSettingsUseCase,
  type GrantWorkspaceAccessInput,
  type UpdateWorkspaceSettingsInput,
  type WorkspaceDTO,
  type WorkspaceGrantDTO,
} from "./_use-cases";

const workspaceRepository = new FirestoreWorkspaceRepository();
const workspaceGrantRepository = new FirestoreWorkspaceGrantRepository();

export type {
  GrantWorkspaceAccessInput,
  UpdateWorkspaceSettingsInput,
  WorkspaceDTO,
  WorkspaceGrantDTO,
};

export async function createWorkspace(id: string, dimensionId: string, name: string) {
  return createWorkspaceUseCase(workspaceRepository, id, dimensionId, name);
}

export async function advanceWorkspaceLifecycle(id: string, newState: WorkspaceDTO["lifecycleState"]) {
  return advanceWorkspaceLifecycleUseCase(workspaceRepository, id, newState);
}

export async function updateWorkspaceSettings(id: string, input: UpdateWorkspaceSettingsInput) {
  return updateWorkspaceSettingsUseCase(workspaceRepository, id, input);
}

export async function mountCapabilities(id: string, caps: readonly WorkspaceCapability[]) {
  return mountCapabilitiesUseCase(workspaceRepository, id, caps);
}

export async function unmountCapability(id: string, capabilityId: string) {
  return unmountCapabilityUseCase(workspaceRepository, id, capabilityId);
}

export async function grantWorkspaceAccess(workspaceId: string, input: GrantWorkspaceAccessInput) {
  return grantWorkspaceAccessUseCase(workspaceGrantRepository, workspaceId, input);
}

export async function revokeWorkspaceAccess(workspaceId: string, grantId: string) {
  return revokeWorkspaceAccessUseCase(workspaceGrantRepository, workspaceId, grantId);
}

export async function updateWorkspaceRole(
  workspaceId: string,
  grantId: string,
  newRole: WorkspaceRole,
) {
  return updateWorkspaceRoleUseCase(workspaceGrantRepository, workspaceId, grantId, newRole);
}

export async function deleteWorkspace(id: string) {
  return deleteWorkspaceUseCase(workspaceRepository, id);
}

export async function addWorkspaceLocation(
  workspaceId: string,
  location: {
    id: string;
    label: string;
    type: "building" | "floor" | "room";
    parentId?: string;
  },
) {
  return addWorkspaceLocationUseCase(workspaceRepository, workspaceId, location);
}

export async function removeWorkspaceLocation(workspaceId: string, locationId: string) {
  return removeWorkspaceLocationUseCase(workspaceRepository, workspaceId, locationId);
}
