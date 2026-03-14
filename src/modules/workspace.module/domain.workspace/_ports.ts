import type { WorkspaceEntity, WorkspaceGrant } from "./_entity";
import type { WorkspaceId, WorkspaceRole } from "./_value-objects";

// ---------------------------------------------------------------------------
// IWorkspaceRepository
// ---------------------------------------------------------------------------

export interface IWorkspaceRepository {
  findById(id: WorkspaceId): Promise<WorkspaceEntity | null>;
  findByDimensionId(dimensionId: string): Promise<WorkspaceEntity[]>;
  save(workspace: WorkspaceEntity): Promise<void>;
  deleteById(id: WorkspaceId): Promise<void>;
}

// ---------------------------------------------------------------------------
// IWorkspaceGrantRepository
// ---------------------------------------------------------------------------

export interface IWorkspaceGrantRepository {
  findByWorkspaceId(workspaceId: WorkspaceId): Promise<WorkspaceGrant[]>;
  addGrant(workspaceId: WorkspaceId, grant: WorkspaceGrant): Promise<void>;
  revokeGrant(workspaceId: WorkspaceId, grantId: string, now: string): Promise<void>;
  updateRole(workspaceId: WorkspaceId, grantId: string, newRole: WorkspaceRole): Promise<void>;
}
