/**
 * Workspace mapper — Firestore document ↔ WorkspaceEntity / WorkspaceTask transformation.
 *
 * Keeps all Firestore-specific field names and null-coercions in one place,
 * so the domain layer never has to know about Firestore's wire format.
 */

import type {
  WorkspaceEntity,
  WorkspaceGrant,
  WorkspaceTask,
  WorkspaceLocation,
  WorkspacePersonnel,
  WorkspaceAddress,
} from "../domain.workspace/_entity";
import type {
  WorkspaceId,
  WorkspaceSlug,
  WorkspaceLifecycleState,
  WorkspaceVisibility,
  WorkspaceRole,
  TaskState,
  TaskPriority,
} from "../domain.workspace/_value-objects";

// ---------------------------------------------------------------------------
// Firestore document shapes (raw, unvalidated)
// ---------------------------------------------------------------------------

/** Raw Firestore document shape for a Workspace. */
export interface WorkspaceDoc {
  id: string;
  dimensionId: string;
  namespaceId: string | null;
  slug: string | null;
  name: string;
  photoURL: string | null;
  lifecycleState: string;
  visibility: string;
  scope: string[];
  protocol: string;
  grants: WorkspaceGrantDoc[] | null;
  teamIds: string[] | null;
  personnel: WorkspacePersonnelDoc | null;
  address: WorkspaceAddressDoc | null;
  locations: WorkspaceLocationDoc[] | null;
  tasks: Record<string, WorkspaceTaskDoc> | null;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceGrantDoc {
  grantId: string;
  userId: string;
  role: string;
  status: string;
  grantedAt: string;
  revokedAt: string | null;
  expiresAt: string | null;
}

export interface WorkspaceLocationDoc {
  locationId: string;
  label: string;
  description: string | null;
  capacity: number | null;
}

export interface WorkspacePersonnelDoc {
  managerId: string | null;
  supervisorId: string | null;
  safetyOfficerId: string | null;
}

export interface WorkspaceAddressDoc {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  details: string | null;
}

export interface WorkspaceTaskDoc {
  id: string;
  name: string;
  description: string | null;
  progressState: string;
  priority: string;
  type: string | null;
  progress: number | null;
  quantity: number | null;
  completedQuantity: number | null;
  unitPrice: number | null;
  unit: string | null;
  subtotal: number;
  parentId: string | null;
  assigneeId: string | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string | null;
}

// ---------------------------------------------------------------------------
// Firestore → Domain
// ---------------------------------------------------------------------------

function grantDocToGrant(d: WorkspaceGrantDoc): WorkspaceGrant {
  return {
    grantId: d.grantId,
    userId: d.userId,
    role: d.role as WorkspaceRole,
    status: d.status as "active" | "revoked" | "expired",
    grantedAt: d.grantedAt,
    ...(d.revokedAt != null ? { revokedAt: d.revokedAt } : {}),
    ...(d.expiresAt != null ? { expiresAt: d.expiresAt } : {}),
  };
}

function locationDocToLocation(d: WorkspaceLocationDoc): WorkspaceLocation {
  return {
    locationId: d.locationId,
    label: d.label,
    ...(d.description != null ? { description: d.description } : {}),
    ...(d.capacity != null ? { capacity: d.capacity } : {}),
  };
}

function personnelDocToPersonnel(
  d: WorkspacePersonnelDoc,
): WorkspacePersonnel {
  return {
    ...(d.managerId != null ? { managerId: d.managerId } : {}),
    ...(d.supervisorId != null ? { supervisorId: d.supervisorId } : {}),
    ...(d.safetyOfficerId != null
      ? { safetyOfficerId: d.safetyOfficerId }
      : {}),
  };
}

function addressDocToAddress(d: WorkspaceAddressDoc): WorkspaceAddress {
  return {
    street: d.street,
    city: d.city,
    state: d.state,
    postalCode: d.postalCode,
    country: d.country,
    ...(d.details != null ? { details: d.details } : {}),
  };
}

function taskDocToTask(d: WorkspaceTaskDoc): WorkspaceTask {
  return {
    id: d.id,
    name: d.name,
    ...(d.description != null ? { description: d.description } : {}),
    progressState: d.progressState as TaskState,
    priority: d.priority as TaskPriority,
    ...(d.type != null ? { type: d.type } : {}),
    ...(d.progress != null ? { progress: d.progress } : {}),
    ...(d.quantity != null ? { quantity: d.quantity } : {}),
    ...(d.completedQuantity != null
      ? { completedQuantity: d.completedQuantity }
      : {}),
    ...(d.unitPrice != null ? { unitPrice: d.unitPrice } : {}),
    ...(d.unit != null ? { unit: d.unit } : {}),
    subtotal: d.subtotal,
    ...(d.parentId != null ? { parentId: d.parentId } : {}),
    ...(d.assigneeId != null ? { assigneeId: d.assigneeId } : {}),
    ...(d.dueDate != null ? { dueDate: d.dueDate } : {}),
    createdAt: d.createdAt,
    ...(d.updatedAt != null ? { updatedAt: d.updatedAt } : {}),
  };
}

/**
 * Maps a raw Firestore WorkspaceDoc to a typed WorkspaceEntity.
 * Throws if required fields are missing.
 */
export function workspaceDocToEntity(d: WorkspaceDoc): WorkspaceEntity {
  const tasksMap: Record<string, WorkspaceTask> = {};
  if (d.tasks) {
    for (const [key, taskDoc] of Object.entries(d.tasks)) {
      tasksMap[key] = taskDocToTask(taskDoc);
    }
  }

  return {
    id: d.id as WorkspaceId,
    dimensionId: d.dimensionId,
    namespaceId: d.namespaceId,
    slug: d.slug as WorkspaceSlug | null,
    name: d.name,
    ...(d.photoURL != null ? { photoURL: d.photoURL } : {}),
    lifecycleState: d.lifecycleState as WorkspaceLifecycleState,
    visibility: d.visibility as WorkspaceVisibility,
    scope: d.scope ?? [],
    protocol: d.protocol ?? "",
    grants: (d.grants ?? []).map(grantDocToGrant),
    teamIds: d.teamIds ?? [],
    ...(d.personnel != null
      ? { personnel: personnelDocToPersonnel(d.personnel) }
      : {}),
    ...(d.address != null
      ? { address: addressDocToAddress(d.address) }
      : {}),
    ...(d.locations != null
      ? { locations: d.locations.map(locationDocToLocation) }
      : {}),
    tasks: tasksMap,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  };
}

// ---------------------------------------------------------------------------
// Domain → Firestore
// ---------------------------------------------------------------------------

function grantToGrantDoc(g: WorkspaceGrant): WorkspaceGrantDoc {
  return {
    grantId: g.grantId,
    userId: g.userId,
    role: g.role,
    status: g.status,
    grantedAt: g.grantedAt,
    revokedAt: g.revokedAt ?? null,
    expiresAt: g.expiresAt ?? null,
  };
}

function locationToLocationDoc(l: WorkspaceLocation): WorkspaceLocationDoc {
  return {
    locationId: l.locationId,
    label: l.label,
    description: l.description ?? null,
    capacity: l.capacity ?? null,
  };
}

function personnelToPersonnelDoc(
  p: WorkspacePersonnel,
): WorkspacePersonnelDoc {
  return {
    managerId: p.managerId ?? null,
    supervisorId: p.supervisorId ?? null,
    safetyOfficerId: p.safetyOfficerId ?? null,
  };
}

function addressToAddressDoc(a: WorkspaceAddress): WorkspaceAddressDoc {
  return {
    street: a.street,
    city: a.city,
    state: a.state,
    postalCode: a.postalCode,
    country: a.country,
    details: a.details ?? null,
  };
}

function taskToTaskDoc(t: WorkspaceTask): WorkspaceTaskDoc {
  return {
    id: t.id,
    name: t.name,
    description: t.description ?? null,
    progressState: t.progressState,
    priority: t.priority,
    type: t.type ?? null,
    progress: t.progress ?? null,
    quantity: t.quantity ?? null,
    completedQuantity: t.completedQuantity ?? null,
    unitPrice: t.unitPrice ?? null,
    unit: t.unit ?? null,
    subtotal: t.subtotal,
    parentId: t.parentId ?? null,
    assigneeId: t.assigneeId ?? null,
    dueDate: t.dueDate ?? null,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt ?? null,
  };
}

/**
 * Maps a WorkspaceEntity to a plain object suitable for Firestore write.
 * The `id` field is written to the document body for snapshot reads.
 */
export function workspaceEntityToDoc(e: WorkspaceEntity): WorkspaceDoc {
  const tasksMap: Record<string, WorkspaceTaskDoc> = {};
  if (e.tasks) {
    for (const [key, task] of Object.entries(e.tasks)) {
      tasksMap[key] = taskToTaskDoc(task);
    }
  }

  return {
    id: e.id,
    dimensionId: e.dimensionId,
    namespaceId: e.namespaceId,
    slug: e.slug,
    name: e.name,
    photoURL: e.photoURL ?? null,
    lifecycleState: e.lifecycleState,
    visibility: e.visibility,
    scope: [...e.scope],
    protocol: e.protocol,
    grants: e.grants.map(grantToGrantDoc),
    teamIds: [...e.teamIds],
    personnel: e.personnel ? personnelToPersonnelDoc(e.personnel) : null,
    address: e.address ? addressToAddressDoc(e.address) : null,
    locations: e.locations
      ? e.locations.map(locationToLocationDoc)
      : null,
    tasks: tasksMap,
    createdAt: e.createdAt,
    updatedAt: e.updatedAt,
  };
}
