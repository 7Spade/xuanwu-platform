'use server';
// Workspace server actions — thin re-exports of application use cases.
export type { WorkspaceDTO, WorkspaceGrantDTO, UpdateWorkspaceSettingsInput } from "./_use-cases";
export {
  createWorkspace,
  getWorkspaceById,
  getWorkspacesByDimension,
  advanceWorkspaceLifecycle,
  updateWorkspaceSettings,
  mountCapabilities,
  unmountCapability,
} from "./_use-cases";
