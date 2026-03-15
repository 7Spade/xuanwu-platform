// Workspace actions — re-export barrel for application use cases.
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
  addWorkspaceLocation,
  removeWorkspaceLocation,
} from "./_use-cases";
