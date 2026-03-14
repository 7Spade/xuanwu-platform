/**
 * Workforce mapper — Firestore document ↔ ScheduleAssignment transformation.
 *
 * Keeps all Firestore-specific field names and null-coercions in one place,
 * so the domain layer never has to know about Firestore's wire format.
 */

import type {
  ScheduleAssignment,
  ScheduleLocation,
} from "../domain.workforce/_entity";
import type {
  ScheduleId,
  ScheduleStatus,
  ScheduleOriginType,
  SkillRequirement,
} from "../domain.workforce/_value-objects";

// ---------------------------------------------------------------------------
// Firestore document shape (raw, unvalidated)
// ---------------------------------------------------------------------------

/** Raw Firestore document shape for a ScheduleAssignment. */
export interface ScheduleDoc {
  id: string;
  accountId: string;
  workspaceId: string;
  workspaceName: string | null;
  title: string;
  description: string | null;
  status: string;
  originType: string;
  originTaskId: string | null;
  assigneeIds: string[];
  location: ScheduleLocationDoc | null;
  locationId: string | null;
  requiredSkills: SkillRequirementDoc[] | null;
  proposedBy: string | null;
  version: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface ScheduleLocationDoc {
  building: string | null;
  floor: string | null;
  room: string | null;
  description: string;
}

export interface SkillRequirementDoc {
  skillSlug: string;
  minTier: string;
  quantity: number;
}

// ---------------------------------------------------------------------------
// Firestore → Domain
// ---------------------------------------------------------------------------

function locationDocToLocation(d: ScheduleLocationDoc): ScheduleLocation {
  return {
    description: d.description,
    ...(d.building != null ? { building: d.building } : {}),
    ...(d.floor != null ? { floor: d.floor } : {}),
    ...(d.room != null ? { room: d.room } : {}),
  };
}

function skillDocToSkillRequirement(d: SkillRequirementDoc): SkillRequirement {
  return {
    skillSlug: d.skillSlug,
    minTier: d.minTier,
    ...(d.quantity != null ? { quantity: d.quantity } : {}),
  };
}

/**
 * Maps a raw Firestore ScheduleDoc to a typed ScheduleAssignment.
 * Throws if required fields are missing.
 */
export function scheduleDocToEntity(d: ScheduleDoc): ScheduleAssignment {
  return {
    id: d.id as ScheduleId,
    accountId: d.accountId,
    workspaceId: d.workspaceId,
    ...(d.workspaceName != null ? { workspaceName: d.workspaceName } : {}),
    title: d.title,
    ...(d.description != null ? { description: d.description } : {}),
    status: d.status as ScheduleStatus,
    originType: d.originType as ScheduleOriginType,
    ...(d.originTaskId != null ? { originTaskId: d.originTaskId } : {}),
    assigneeIds: d.assigneeIds ?? [],
    ...(d.location != null
      ? { location: locationDocToLocation(d.location) }
      : {}),
    ...(d.locationId != null ? { locationId: d.locationId } : {}),
    ...(d.requiredSkills != null
      ? {
          requiredSkills: d.requiredSkills.map(skillDocToSkillRequirement),
        }
      : {}),
    ...(d.proposedBy != null ? { proposedBy: d.proposedBy } : {}),
    version: d.version ?? 0,
    startDate: d.startDate,
    endDate: d.endDate,
    createdAt: d.createdAt,
    ...(d.updatedAt != null ? { updatedAt: d.updatedAt } : {}),
  };
}

// ---------------------------------------------------------------------------
// Domain → Firestore
// ---------------------------------------------------------------------------

function locationToLocationDoc(l: ScheduleLocation): ScheduleLocationDoc {
  return {
    description: l.description,
    building: l.building ?? null,
    floor: l.floor ?? null,
    room: l.room ?? null,
  };
}

function skillRequirementToSkillDoc(
  r: SkillRequirement,
): SkillRequirementDoc {
  return {
    skillSlug: r.skillSlug,
    minTier: r.minTier,
    quantity: r.quantity ?? 1,
  };
}

/**
 * Maps a ScheduleAssignment to a plain object suitable for Firestore write.
 * The `id` field is written to the document body for snapshot reads.
 */
export function scheduleEntityToDoc(e: ScheduleAssignment): ScheduleDoc {
  return {
    id: e.id,
    accountId: e.accountId,
    workspaceId: e.workspaceId,
    workspaceName: e.workspaceName ?? null,
    title: e.title,
    description: e.description ?? null,
    status: e.status,
    originType: e.originType,
    originTaskId: e.originTaskId ?? null,
    assigneeIds: [...e.assigneeIds],
    location: e.location ? locationToLocationDoc(e.location) : null,
    locationId: e.locationId ?? null,
    requiredSkills: e.requiredSkills
      ? e.requiredSkills.map(skillRequirementToSkillDoc)
      : null,
    proposedBy: e.proposedBy ?? null,
    version: e.version,
    startDate: e.startDate,
    endDate: e.endDate,
    createdAt: e.createdAt,
    updatedAt: e.updatedAt ?? null,
  };
}
