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

// Pure domain utilities (no I/O)
export {
  summarizeWorkflowBlockers,
  deriveWorkflowBlockersFromSources,
  applyWorkflowBlocked,
  applyWorkflowUnblocked,
} from "./domain.workspace/workflow-blockers-state";
export type { WorkflowBlockersState, WorkflowBlockersSummary } from "./domain.workspace/workflow-blockers-state";

export type {
  IWorkspaceRepository,
  IWorkspaceGrantRepository,
} from "./domain.workspace/_ports";

// Entity types for cross-module use (e.g. domain service filter operations)
export type { WorkspaceEntity } from "./domain.workspace/_entity";
export { hasWorkspaceAccess } from "./domain.workspace/_entity";

// Presentation components (client-only)
export { useWorkspace } from "./_components/use-workspace";
export { WorkspaceNavTabs } from "./_components/workspace-nav-tabs";
export { WorkspaceShell } from "./_components/workspace-shell";
export { WorkspaceStatusBar } from "./_components/workspace-status-bar";
export { WorkspaceCapabilitiesView } from "./_components/workspace-capabilities-view";
export { WorkspaceGrantsView } from "./_components/workspace-grants-view";
