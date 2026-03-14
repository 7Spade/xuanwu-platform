// workspace.module — Public API barrel
// Bounded Context: Workspace · WBS · Issue · Change Request · QA · Acceptance · Baseline
//
// Exports: DTOs, application use cases, port interfaces.
// NEVER export entities, value objects, repositories, or domain events directly.

export type { WorkspaceDTO, WorkspaceGrantDTO } from "./core/_use-cases";

export {
  createWorkspace,
  getWorkspaceById,
  getWorkspacesByDimension,
  advanceWorkspaceLifecycle,
  filterVisibleWorkspaces,
} from "./core/_use-cases";

export type {
  IWorkspaceRepository,
  IWorkspaceGrantRepository,
} from "./domain.workspace/_ports";

// Entity types for cross-module use (e.g. domain service filter operations)
export type { WorkspaceEntity } from "./domain.workspace/_entity";
export { hasWorkspaceAccess } from "./domain.workspace/_entity";
