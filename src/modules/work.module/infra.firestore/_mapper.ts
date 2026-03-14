/**
 * Work mapper — Firestore document ↔ WorkItemEntity / MilestoneEntity transformation.
 *
 * Keeps all Firestore-specific field names and null-coercions in one place,
 * so the domain layer never has to know about Firestore's wire format.
 */

import type { WorkItemEntity, MilestoneEntity, WorkDependency, TaskLocation } from "../domain.work/_entity";
import type {
  WorkItemId,
  MilestoneId,
  WorkItemStatus,
  WorkItemPriority,
  DependencyType,
} from "../domain.work/_value-objects";

// ---------------------------------------------------------------------------
// Firestore document shapes (raw, unvalidated)
// ---------------------------------------------------------------------------

export interface WorkDependencyDoc {
  sourceId: string;
  targetId: string;
  type: string;
}

/** Raw Firestore document shape for a WorkItem. */
export interface WorkItemDoc {
  id: string;
  workspaceId: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  milestoneId: string | null;
  assigneeId: string | null;
  dueDate: string | null;
  dependencies: WorkDependencyDoc[];
  createdAt: string;
  updatedAt: string;
  // Wave 43 extensions
  parentId?: string | null;
  type?: string | null;
  quantity?: number | null;
  unitPrice?: number | null;
  discount?: number | null;
  subtotal?: number | null;
  completedQuantity?: number | null;
  location?: { building?: string | null; floor?: string | null; room?: string | null; description?: string | null } | null;
  photoURLs?: string[] | null;
  sourceIntentIndex?: number | null;
}

/** Raw Firestore document shape for a Milestone. */
export interface MilestoneDoc {
  id: string;
  workspaceId: string;
  name: string;
  targetDate: string;
  workItemIds: string[];
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Firestore → Domain
// ---------------------------------------------------------------------------

function dependencyDocToDependency(d: WorkDependencyDoc): WorkDependency {
  return {
    sourceId: d.sourceId as WorkItemId,
    targetId: d.targetId as WorkItemId,
    type: d.type as DependencyType,
  };
}

/**
 * Maps a raw Firestore WorkItemDoc to a typed WorkItemEntity.
 * Throws if required fields are missing.
 */
export function workItemDocToEntity(d: WorkItemDoc): WorkItemEntity {
  const loc = d.location;
  return {
    id: d.id as WorkItemId,
    workspaceId: d.workspaceId,
    title: d.title,
    ...(d.description != null ? { description: d.description } : {}),
    status: d.status as WorkItemStatus,
    priority: d.priority as WorkItemPriority,
    ...(d.milestoneId != null ? { milestoneId: d.milestoneId as MilestoneId } : {}),
    ...(d.assigneeId != null ? { assigneeId: d.assigneeId } : {}),
    ...(d.dueDate != null ? { dueDate: d.dueDate } : {}),
    dependencies: (d.dependencies ?? []).map(dependencyDocToDependency),
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
    // Wave 43 extensions
    ...(d.parentId != null ? { parentId: d.parentId as WorkItemId } : {}),
    ...(d.type != null ? { type: d.type } : {}),
    ...(d.quantity != null ? { quantity: d.quantity } : {}),
    ...(d.unitPrice != null ? { unitPrice: d.unitPrice } : {}),
    ...(d.discount != null ? { discount: d.discount } : {}),
    ...(d.subtotal != null ? { subtotal: d.subtotal } : {}),
    ...(d.completedQuantity != null ? { completedQuantity: d.completedQuantity } : {}),
    ...(loc != null ? {
      location: {
        ...(loc.building != null ? { building: loc.building } : {}),
        ...(loc.floor != null ? { floor: loc.floor } : {}),
        ...(loc.room != null ? { room: loc.room } : {}),
        ...(loc.description != null ? { description: loc.description } : {}),
      } as TaskLocation,
    } : {}),
    ...(d.photoURLs != null && d.photoURLs.length > 0 ? { photoURLs: d.photoURLs } : {}),
    ...(d.sourceIntentIndex != null ? { sourceIntentIndex: d.sourceIntentIndex } : {}),
  };
}

/**
 * Maps a raw Firestore MilestoneDoc to a typed MilestoneEntity.
 */
export function milestoneDocToEntity(d: MilestoneDoc): MilestoneEntity {
  return {
    id: d.id as MilestoneId,
    workspaceId: d.workspaceId,
    name: d.name,
    targetDate: d.targetDate,
    workItemIds: (d.workItemIds ?? []) as WorkItemId[],
    createdAt: d.createdAt,
  };
}

// ---------------------------------------------------------------------------
// Domain → Firestore
// ---------------------------------------------------------------------------

function dependencyToDependencyDoc(dep: WorkDependency): WorkDependencyDoc {
  return {
    sourceId: dep.sourceId,
    targetId: dep.targetId,
    type: dep.type,
  };
}

/**
 * Maps a WorkItemEntity to a plain object suitable for Firestore write.
 * The `id` field is written to the document body for snapshot reads.
 */
export function workItemEntityToDoc(e: WorkItemEntity): WorkItemDoc {
  return {
    id: e.id,
    workspaceId: e.workspaceId,
    title: e.title,
    description: e.description ?? null,
    status: e.status,
    priority: e.priority,
    milestoneId: e.milestoneId ?? null,
    assigneeId: e.assigneeId ?? null,
    dueDate: e.dueDate ?? null,
    dependencies: e.dependencies.map(dependencyToDependencyDoc),
    createdAt: e.createdAt,
    updatedAt: e.updatedAt,
    // Wave 43 extensions
    parentId: e.parentId ?? null,
    type: e.type ?? null,
    quantity: e.quantity ?? null,
    unitPrice: e.unitPrice ?? null,
    discount: e.discount ?? null,
    subtotal: e.subtotal ?? null,
    completedQuantity: e.completedQuantity ?? null,
    location: e.location ? {
      building: e.location.building ?? null,
      floor: e.location.floor ?? null,
      room: e.location.room ?? null,
      description: e.location.description ?? null,
    } : null,
    photoURLs: e.photoURLs ? [...e.photoURLs] : null,
    sourceIntentIndex: e.sourceIntentIndex ?? null,
  };
}

/**
 * Maps a MilestoneEntity to a plain object suitable for Firestore write.
 */
export function milestoneEntityToDoc(e: MilestoneEntity): MilestoneDoc {
  return {
    id: e.id,
    workspaceId: e.workspaceId,
    name: e.name,
    targetDate: e.targetDate,
    workItemIds: [...e.workItemIds],
    createdAt: e.createdAt,
  };
}
