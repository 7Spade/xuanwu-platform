'use server';
// Workspace server actions — thin re-exports of application use cases.
export type { WorkspaceDTO } from "./_use-cases";
export {
  createWorkspace,
  getWorkspaceById,
  getWorkspacesByDimension,
  advanceWorkspaceLifecycle,
} from "./_use-cases";
