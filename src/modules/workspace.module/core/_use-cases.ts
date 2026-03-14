import { ok, fail } from "@/shared";
import type { Result } from "@/shared";
import type { WorkspaceEntity } from "../domain.workspace/_entity";
import { buildWorkspace, hasWorkspaceAccess } from "../domain.workspace/_entity";
import type {
  WorkspaceId,
  WorkspaceLifecycleState,
  WorkspaceVisibility,
  WorkspaceRole,
  WorkspaceCapability,
} from "../domain.workspace/_value-objects";
import type { WorkspaceAddress, WorkspaceLocation } from "../domain.workspace/_entity";
import type { IWorkspaceRepository } from "../domain.workspace/_ports";

// ---------------------------------------------------------------------------
// DTOs
// ---------------------------------------------------------------------------

export interface WorkspaceDTO {
  readonly id: string;
  readonly dimensionId: string;
  readonly namespaceId: string | null;
  readonly slug: string | null;
  readonly name: string;
  readonly photoURL?: string;
  readonly lifecycleState: WorkspaceLifecycleState;
  readonly visibility: WorkspaceVisibility;
  readonly capabilities?: readonly WorkspaceCapability[];
  readonly grants?: readonly WorkspaceGrantDTO[];
  readonly address?: WorkspaceAddress;
  readonly locations?: readonly WorkspaceLocation[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface WorkspaceGrantDTO {
  readonly grantId: string;
  readonly userId: string;
  readonly role: WorkspaceRole;
  readonly status: "active" | "revoked" | "expired";
  readonly grantedAt: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function entityToDTO(workspace: WorkspaceEntity): WorkspaceDTO {
  return {
    id: workspace.id,
    dimensionId: workspace.dimensionId,
    namespaceId: workspace.namespaceId,
    slug: workspace.slug,
    name: workspace.name,
    photoURL: workspace.photoURL,
    lifecycleState: workspace.lifecycleState,
    visibility: workspace.visibility,
    ...(workspace.capabilities != null
      ? { capabilities: workspace.capabilities }
      : {}),
    ...(workspace.grants != null && workspace.grants.length > 0
      ? {
          grants: workspace.grants
            .filter((g) => g.status === "active")
            .map((g) => ({
              grantId: g.grantId,
              userId: g.userId,
              role: g.role,
              status: g.status as "active" | "revoked" | "expired",
              grantedAt: g.grantedAt,
            })),
        }
      : {}),
    ...(workspace.address != null ? { address: workspace.address } : {}),
    ...(workspace.locations != null && workspace.locations.length > 0
      ? { locations: workspace.locations }
      : {}),
    createdAt: workspace.createdAt,
    updatedAt: workspace.updatedAt,
  };
}

// ---------------------------------------------------------------------------
// Use Cases
// ---------------------------------------------------------------------------

/**
 * CreateWorkspaceUseCase
 * Creates a new workspace owned by the given account (dimensionId).
 */
export async function createWorkspace(
  repo: IWorkspaceRepository,
  id: string,
  dimensionId: string,
  name: string,
): Promise<Result<WorkspaceDTO>> {
  try {
    const now = new Date().toISOString();
    const workspace = buildWorkspace(id as WorkspaceId, dimensionId, name, now);
    await repo.save(workspace);
    return ok(entityToDTO(workspace));
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

/**
 * GetWorkspaceByIdUseCase
 * Returns the workspace DTO for the given id, or null if not found.
 */
export async function getWorkspaceById(
  repo: IWorkspaceRepository,
  id: string,
): Promise<Result<WorkspaceDTO | null>> {
  try {
    const workspace = await repo.findById(id as WorkspaceId);
    return ok(workspace ? entityToDTO(workspace) : null);
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

/**
 * GetWorkspacesByDimensionUseCase
 * Returns all workspaces for an account (dimensionId).
 */
export async function getWorkspacesByDimension(
  repo: IWorkspaceRepository,
  dimensionId: string,
): Promise<Result<WorkspaceDTO[]>> {
  try {
    const workspaces = await repo.findByDimensionId(dimensionId);
    return ok(workspaces.map(entityToDTO));
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

/**
 * AdvanceWorkspaceLifecycleUseCase
 * Transitions a workspace to the next lifecycle state.
 * Invariant: preparatory → active → stopped (no backward transitions).
 */
export async function advanceWorkspaceLifecycle(
  repo: IWorkspaceRepository,
  id: string,
  newState: WorkspaceLifecycleState,
): Promise<Result<WorkspaceDTO>> {
  const ALLOWED_TRANSITIONS: Record<WorkspaceLifecycleState, WorkspaceLifecycleState[]> = {
    preparatory: ["active"],
    active: ["stopped"],
    stopped: [],
  };

  try {
    const existing = await repo.findById(id as WorkspaceId);
    if (!existing) return fail(new Error(`Workspace not found: ${id}`));

    const allowed = ALLOWED_TRANSITIONS[existing.lifecycleState];
    if (!allowed.includes(newState)) {
      return fail(
        new Error(
          `Invalid lifecycle transition: ${existing.lifecycleState} → ${newState}`,
        ),
      );
    }

    const now = new Date().toISOString();
    const updated: WorkspaceEntity = {
      ...existing,
      lifecycleState: newState,
      updatedAt: now,
    };
    await repo.save(updated);
    return ok(entityToDTO(updated));
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

/**
 * FilterVisibleWorkspacesUseCase
 * Returns workspaces visible to a user given their team memberships.
 * Pure function — no I/O, accepts pre-loaded workspace list.
 */
export function filterVisibleWorkspaces(
  workspaces: WorkspaceEntity[],
  dimensionId: string,
  userId: string,
  userTeamIds: ReadonlySet<string>,
  isOrgOwner: boolean,
): WorkspaceDTO[] {
  const dimensionWorkspaces = workspaces.filter(
    (w) => w.dimensionId === dimensionId,
  );

  if (isOrgOwner) return dimensionWorkspaces.map(entityToDTO);

  return dimensionWorkspaces
    .filter((w) =>
      w.visibility === "visible" ||
      hasWorkspaceAccess(w, userId, userTeamIds),
    )
    .map(entityToDTO);
}
