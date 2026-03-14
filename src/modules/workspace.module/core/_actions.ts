'use server';
// Workspace server actions — thin re-exports of application use cases.
export type { WorkspaceDTO, WorkspaceGrantDTO, UpdateWorkspaceSettingsInput, GrantWorkspaceAccessInput } from "./_use-cases";
export {
  createWorkspace,
  getWorkspaceById,
  getWorkspacesByDimension,
  advanceWorkspaceLifecycle,
  updateWorkspaceSettings,
  mountCapabilities,
  unmountCapability,
  grantWorkspaceAccess,
  revokeWorkspaceAccess,
  updateWorkspaceRole,
  deleteWorkspace,
} from "./_use-cases";
