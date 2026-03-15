import { ok, fail } from "@/shared";
import type { Result } from "@/shared";
import type { WorkspaceEntity, WorkspaceAddress, WorkspaceLocation, WorkspacePersonnel } from "../domain.workspace/_entity";
import { buildWorkspace, hasWorkspaceAccess } from "../domain.workspace/_entity";
import type {
  WorkspaceId,
  WorkspaceLifecycleState,
  WorkspaceVisibility,
  WorkspaceCapability,
} from "../domain.workspace/_value-objects";
export type { WorkspaceRole } from "../domain.workspace/_value-objects";
import type { WorkspaceRole } from "../domain.workspace/_value-objects";
import type { IWorkspaceRepository, IWorkspaceGrantRepository } from "../domain.workspace/_ports";

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
  readonly personnel?: WorkspacePersonnel;
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
    ...(workspace.personnel != null ? { personnel: workspace.personnel } : {}),
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

// ---------------------------------------------------------------------------
// UpdateWorkspaceSettingsUseCase
// ---------------------------------------------------------------------------

export interface UpdateWorkspaceSettingsInput {
  name?: string;
  visibility?: WorkspaceVisibility;
  lifecycleState?: WorkspaceLifecycleState;
  address?: WorkspaceAddress;
  personnel?: WorkspacePersonnel;
  photoURL?: string;
}

/**
 * Updates mutable workspace metadata.
 * Does NOT enforce lifecycle state transitions — callers may override freely.
 */
export async function updateWorkspaceSettings(
  repo: IWorkspaceRepository,
  id: string,
  input: UpdateWorkspaceSettingsInput,
): Promise<Result<WorkspaceDTO>> {
  try {
    const existing = await repo.findById(id as WorkspaceId);
    if (!existing) return fail(new Error(`Workspace not found: ${id}`));

    const now = new Date().toISOString();
    const updated: WorkspaceEntity = {
      ...existing,
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.visibility !== undefined ? { visibility: input.visibility } : {}),
      ...(input.lifecycleState !== undefined ? { lifecycleState: input.lifecycleState } : {}),
      ...(input.address !== undefined ? { address: input.address } : {}),
      ...(input.personnel !== undefined ? { personnel: input.personnel } : {}),
      ...(input.photoURL !== undefined ? { photoURL: input.photoURL } : {}),
      updatedAt: now,
    };
    await repo.save(updated);
    return ok(entityToDTO(updated));
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

// ---------------------------------------------------------------------------
// MountCapabilitiesUseCase
// ---------------------------------------------------------------------------

/**
 * Mounts one or more capabilities onto a workspace.
 * Idempotent — silently skips capabilities that are already mounted.
 */
export async function mountCapabilities(
  repo: IWorkspaceRepository,
  id: string,
  caps: readonly WorkspaceCapability[],
): Promise<Result<WorkspaceDTO>> {
  try {
    const existing = await repo.findById(id as WorkspaceId);
    if (!existing) return fail(new Error(`Workspace not found: ${id}`));

    const alreadyMounted = new Set((existing.capabilities ?? []).map((c) => c.id));
    const toAdd = caps.filter((c) => !alreadyMounted.has(c.id));

    if (toAdd.length === 0) return ok(entityToDTO(existing));

    const now = new Date().toISOString();
    const updated: WorkspaceEntity = {
      ...existing,
      capabilities: [...(existing.capabilities ?? []), ...toAdd],
      updatedAt: now,
    };
    await repo.save(updated);
    return ok(entityToDTO(updated));
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

// ---------------------------------------------------------------------------
// UnmountCapabilityUseCase
// ---------------------------------------------------------------------------

/**
 * Removes a capability from a workspace by its ID.
 */
export async function unmountCapability(
  repo: IWorkspaceRepository,
  id: string,
  capabilityId: string,
): Promise<Result<WorkspaceDTO>> {
  try {
    const existing = await repo.findById(id as WorkspaceId);
    if (!existing) return fail(new Error(`Workspace not found: ${id}`));

    const now = new Date().toISOString();
    const updated: WorkspaceEntity = {
      ...existing,
      capabilities: (existing.capabilities ?? []).filter((c) => c.id !== capabilityId),
      updatedAt: now,
    };
    await repo.save(updated);
    return ok(entityToDTO(updated));
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

// ---------------------------------------------------------------------------
// GrantWorkspaceAccess
// ---------------------------------------------------------------------------

export interface GrantWorkspaceAccessInput {
  readonly userId: string;
  readonly role: WorkspaceRole;
}

/**
 * Adds a new active WorkspaceGrant for a user.
 * Idempotent: if the user already has an active grant, it updates the role.
 */
export async function grantWorkspaceAccess(
  grantRepo: IWorkspaceGrantRepository,
  workspaceId: string,
  input: GrantWorkspaceAccessInput,
): Promise<Result<void>> {
  try {
    const existing = await grantRepo.findByWorkspaceId(workspaceId as WorkspaceId);
    const active = existing.find(
      (g) => g.userId === input.userId && g.status === "active",
    );
    const now = new Date().toISOString();
    if (active) {
      if (active.role !== input.role) {
        await grantRepo.updateRole(workspaceId as WorkspaceId, active.grantId, input.role);
      }
      return ok(undefined);
    }
    const grant: import("../domain.workspace/_entity").WorkspaceGrant = {
      grantId: `grant-${crypto.randomUUID()}`,
      userId: input.userId,
      role: input.role,
      status: "active",
      grantedAt: now,
    };
    await grantRepo.addGrant(workspaceId as WorkspaceId, grant);
    return ok(undefined);
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

// ---------------------------------------------------------------------------
// RevokeWorkspaceAccess
// ---------------------------------------------------------------------------

/**
 * Revokes a WorkspaceGrant by grantId (sets status to "revoked").
 */
export async function revokeWorkspaceAccess(
  grantRepo: IWorkspaceGrantRepository,
  workspaceId: string,
  grantId: string,
): Promise<Result<void>> {
  try {
    await grantRepo.revokeGrant(workspaceId as WorkspaceId, grantId, new Date().toISOString());
    return ok(undefined);
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

// ---------------------------------------------------------------------------
// UpdateWorkspaceRole
// ---------------------------------------------------------------------------

/**
 * Updates the role of an existing active grant.
 */
export async function updateWorkspaceRole(
  grantRepo: IWorkspaceGrantRepository,
  workspaceId: string,
  grantId: string,
  newRole: WorkspaceRole,
): Promise<Result<void>> {
  try {
    await grantRepo.updateRole(workspaceId as WorkspaceId, grantId, newRole);
    return ok(undefined);
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

// ---------------------------------------------------------------------------
// DeleteWorkspace
// ---------------------------------------------------------------------------

/**
 * Permanently deletes a workspace and all its data.
 * This is a destructive irreversible operation.
 */
export async function deleteWorkspace(
  repo: IWorkspaceRepository,
  id: string,
): Promise<Result<void>> {
  try {
    const existing = await repo.findById(id as WorkspaceId);
    if (!existing) return fail(new Error(`Workspace not found: ${id}`));
    await repo.deleteById(id as WorkspaceId);
    return ok(undefined);
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

// ---------------------------------------------------------------------------
// AddWorkspaceLocation
// ---------------------------------------------------------------------------

/**
 * Adds a new sub-location to a workspace.
 * Generates a unique locationId for the new location.
 */
export async function addWorkspaceLocation(
  repo: IWorkspaceRepository,
  workspaceId: string,
  location: {
    id: string;
    label: string;
    type: "building" | "floor" | "room";
    parentId?: string;
  },
): Promise<Result<WorkspaceDTO>> {
  try {
    const existing = await repo.findById(workspaceId as WorkspaceId);
    if (!existing) return fail(new Error(`Workspace not found: ${workspaceId}`));

    const newLocation: WorkspaceLocation = {
      locationId: location.id,
      label: location.label,
      type: location.type,
      ...(location.parentId ? { parentId: location.parentId } : {}),
    };

    const now = new Date().toISOString();
    const updated: WorkspaceEntity = {
      ...existing,
      locations: [...(existing.locations ?? []), newLocation],
      updatedAt: now,
    };
    await repo.save(updated);
    return ok(entityToDTO(updated));
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

// ---------------------------------------------------------------------------
// RemoveWorkspaceLocation
// ---------------------------------------------------------------------------

/**
 * Removes a sub-location from a workspace by its locationId.
 * Also removes any child locations that reference this location as parentId.
 */
export async function removeWorkspaceLocation(
  repo: IWorkspaceRepository,
  workspaceId: string,
  locationId: string,
): Promise<Result<WorkspaceDTO>> {
  try {
    const existing = await repo.findById(workspaceId as WorkspaceId);
    if (!existing) return fail(new Error(`Workspace not found: ${workspaceId}`));

    const now = new Date().toISOString();
    const updated: WorkspaceEntity = {
      ...existing,
      locations: (existing.locations ?? []).filter(
        (l) => l.locationId !== locationId && l.parentId !== locationId,
      ),
      updatedAt: now,
    };
    await repo.save(updated);
    return ok(entityToDTO(updated));
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}
