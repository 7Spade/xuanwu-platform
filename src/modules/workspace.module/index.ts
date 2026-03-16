// workspace.module — Public API barrel
// Bounded Context: Workspace · WBS · Issue · Change Request · QA · Acceptance · Baseline
//
// Exports: DTOs, application use cases, port interfaces.
// NEVER export entities, value objects, repositories, or domain events directly.

export type { WorkspaceDTO, WorkspaceGrantDTO, GrantWorkspaceAccessInput } from "./core/_actions";
export type { WorkspaceRole } from "./core/_use-cases";

export {
  createWorkspace,
  advanceWorkspaceLifecycle,
  grantWorkspaceAccess,
  revokeWorkspaceAccess,
  updateWorkspaceRole,
  deleteWorkspace,
  mountCapabilities,
  unmountCapability,
  updateWorkspaceSettings,
} from "./core/_actions";
export {
  filterVisibleWorkspaces,
  getWorkspaceById,
  getWorkspacesByDimension,
} from "./core/_queries";

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

// Presentation components (client-only)
export { useWorkspace } from "./_components/use-workspace";
export { WorkspaceNavTabs } from "./_components/workspace-nav-tabs";
export { WorkspaceShell } from "./_components/workspace-shell";
export { WorkspaceStatusBar } from "./_components/workspace-status-bar";
export { WorkspaceCapabilitiesView } from "./_components/workspace-capabilities-view";
export { WorkspaceGrantsView } from "./_components/workspace-grants-view";
export { WorkspaceSettingsDialog } from "./_components/workspace-settings-dialog";
export { CAPABILITY_SPECS, NON_MOUNTABLE_CAPABILITY_IDS } from "./core/_capabilities";
export type { WorkspaceCapability } from "./core/_capabilities";
