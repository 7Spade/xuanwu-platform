import type {
  WorkspaceId,
  WorkspaceSlug,
  WorkspaceLifecycleState,
  WorkspaceVisibility,
  WorkspaceRole,
  TaskState,
  TaskPriority,
  WorkspaceCapability,
} from "./_value-objects";

// ---------------------------------------------------------------------------
// WorkspaceGrant — access control record
// ---------------------------------------------------------------------------

/** An explicit access grant assigned to a user for a workspace. */
export interface WorkspaceGrant {
  readonly grantId: string;
  readonly userId: string;
  readonly role: WorkspaceRole;
  readonly status: "active" | "revoked" | "expired";
  readonly grantedAt: string;  // ISO-8601
  readonly revokedAt?: string; // ISO-8601
  readonly expiresAt?: string; // ISO-8601
}

// ---------------------------------------------------------------------------
// WorkspaceLocation — sub-location (廠區子地點)
// ---------------------------------------------------------------------------

/** A named sub-location within a workspace facility. */
export interface WorkspaceLocation {
  readonly locationId: string;
  readonly label: string;
  readonly description?: string;
  readonly capacity?: number;
}

// ---------------------------------------------------------------------------
// WorkspacePersonnel — designated role-holders
// ---------------------------------------------------------------------------

/** Designated responsibility holders for a workspace (Manager / Supervisor / Safety Officer). */
export interface WorkspacePersonnel {
  readonly managerId?: string;
  readonly supervisorId?: string;
  readonly safetyOfficerId?: string;
}

// ---------------------------------------------------------------------------
// WorkspaceAddress
// ---------------------------------------------------------------------------

export interface WorkspaceAddress {
  readonly street: string;
  readonly city: string;
  readonly state: string;
  readonly postalCode: string;
  readonly country: string;
  readonly details?: string;
}

// ---------------------------------------------------------------------------
// WorkspaceTask — WBS task
// ---------------------------------------------------------------------------

/** A single WBS (Work Breakdown Structure) task within a workspace. */
export interface WorkspaceTask {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly progressState: TaskState;
  readonly priority: TaskPriority;
  readonly type?: string;
  readonly progress?: number;
  readonly quantity?: number;
  readonly completedQuantity?: number;
  readonly unitPrice?: number;
  readonly unit?: string;
  readonly subtotal: number;
  readonly parentId?: string;
  readonly assigneeId?: string;
  readonly dueDate?: string;   // ISO-8601
  readonly createdAt: string;  // ISO-8601
  readonly updatedAt?: string; // ISO-8601
}

// ---------------------------------------------------------------------------
// WorkspaceEntity — aggregate root
// ---------------------------------------------------------------------------

/**
 * The Workspace aggregate root.
 *
 * Invariants:
 *   - A Workspace is owned by one Account (personal or org) via dimensionId.
 *   - Workspace lifecycle follows: preparatory → active → stopped.
 *   - Access is controlled by explicit WorkspaceGrants and team memberships.
 *   - Workspace slug is unique within its namespace.
 */
export interface WorkspaceEntity {
  readonly id: WorkspaceId;
  readonly dimensionId: string;       // the owning account's id
  readonly namespaceId: string | null; // linked namespace (set at registration)
  readonly slug: WorkspaceSlug | null; // URL-safe slug within its namespace
  readonly name: string;
  readonly photoURL?: string;
  readonly lifecycleState: WorkspaceLifecycleState;
  readonly visibility: WorkspaceVisibility;
  readonly scope: readonly string[];
  readonly protocol: string;
  readonly grants: readonly WorkspaceGrant[];
  readonly teamIds: readonly string[];
  readonly personnel?: WorkspacePersonnel;
  readonly address?: WorkspaceAddress;
  readonly locations?: readonly WorkspaceLocation[];
  readonly capabilities?: readonly WorkspaceCapability[];
  readonly tasks?: Record<string, WorkspaceTask>;
  readonly createdAt: string;  // ISO-8601
  readonly updatedAt: string;  // ISO-8601
}

// ---------------------------------------------------------------------------
// Access predicates
// ---------------------------------------------------------------------------

/** Returns true when a user has an explicit individual access grant for the workspace. */
export function hasDirectGrant(
  workspace: WorkspaceEntity,
  userId: string,
): boolean {
  return workspace.grants.some(
    (g) => g.userId === userId && g.status === "active",
  );
}

/** Returns true when a user has access through any of their team memberships. */
export function hasTeamGrant(
  workspace: WorkspaceEntity,
  userTeamIds: ReadonlySet<string>,
): boolean {
  return workspace.teamIds.some((teamId) => userTeamIds.has(teamId));
}

/** Returns true when a user may access this workspace. */
export function hasWorkspaceAccess(
  workspace: WorkspaceEntity,
  userId: string,
  userTeamIds: ReadonlySet<string>,
): boolean {
  return hasDirectGrant(workspace, userId) || hasTeamGrant(workspace, userTeamIds);
}

// ---------------------------------------------------------------------------
// Factory helpers
// ---------------------------------------------------------------------------

/** Create a new WorkspaceEntity in the preparatory lifecycle state. */
export function buildWorkspace(
  id: WorkspaceId,
  dimensionId: string,
  name: string,
  now: string,
): WorkspaceEntity {
  return {
    id,
    dimensionId,
    namespaceId: null,
    slug: null,
    name,
    lifecycleState: "preparatory",
    visibility: "hidden",
    scope: [],
    protocol: "",
    grants: [],
    teamIds: [],
    tasks: {},
    createdAt: now,
    updatedAt: now,
  };
}
