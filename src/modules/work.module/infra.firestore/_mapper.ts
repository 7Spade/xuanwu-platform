/**
 * Work mapper — Firestore document ↔ WorkItemEntity / MilestoneEntity transformation.
 *
 * Keeps all Firestore-specific field names and null-coercions in one place,
 * so the domain layer never has to know about Firestore's wire format.
 */

import type { WorkItemEntity, MilestoneEntity, WorkDependency } from "../domain.work/_entity";
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
