/**
 * Audit mapper — Firestore document ↔ AuditEntry transformation.
 *
 * Keeps all Firestore-specific field names and null-coercions in one place,
 * so the domain layer never has to know about Firestore's wire format.
 *
 * AuditEntries are append-only: this mapper never produces update payloads.
 */

import type { AuditEntry, ActorRef, ResourceRef } from "../domain.audit/_entity";
import type { AuditEntryId, AuditAction } from "../domain.audit/_value-objects";

// ---------------------------------------------------------------------------
// Firestore document shapes (raw, unvalidated)
// ---------------------------------------------------------------------------

/** Raw Firestore sub-document for ActorRef. */
export interface ActorRefDoc {
  identityId: string;
  accountId: string;
  accountHandle: string | null;
}

/** Raw Firestore sub-document for ResourceRef. */
export interface ResourceRefDoc {
  resourceType: string;
  resourceId: string;
  workspaceId: string | null;
}

/** Raw Firestore document shape for an AuditEntry. */
export interface AuditEntryDoc {
  id: string;
  actor: ActorRefDoc;
  action: string;
  resource: ResourceRefDoc;
  metadata: Record<string, unknown> | null;
  originEventId: string | null;
  outcome: string;
  occurredAt: string;
}

// ---------------------------------------------------------------------------
// Converters
// ---------------------------------------------------------------------------

function actorRefDocToEntity(doc: ActorRefDoc): ActorRef {
  return {
    identityId: doc.identityId,
    accountId: doc.accountId,
    accountHandle: doc.accountHandle,
  };
}

function resourceRefDocToEntity(doc: ResourceRefDoc): ResourceRef {
  return {
    resourceType: doc.resourceType,
    resourceId: doc.resourceId,
    workspaceId: doc.workspaceId ?? undefined,
  };
}

function actorRefToDoc(actor: ActorRef): ActorRefDoc {
  return {
    identityId: actor.identityId,
    accountId: actor.accountId,
    accountHandle: actor.accountHandle,
  };
}

function resourceRefToDoc(resource: ResourceRef): ResourceRefDoc {
  return {
    resourceType: resource.resourceType,
    resourceId: resource.resourceId,
    workspaceId: resource.workspaceId ?? null,
  };
}

export function auditEntryDocToEntity(doc: AuditEntryDoc): AuditEntry {
  return {
    id: doc.id as AuditEntryId,
    actor: actorRefDocToEntity(doc.actor),
    action: doc.action as AuditAction,
    resource: resourceRefDocToEntity(doc.resource),
    metadata: doc.metadata ?? undefined,
    originEventId: doc.originEventId ?? undefined,
    outcome: doc.outcome as "success" | "blocked",
    occurredAt: doc.occurredAt,
  };
}

export function auditEntryToDoc(entry: AuditEntry): AuditEntryDoc {
  return {
    id: entry.id,
    actor: actorRefToDoc(entry.actor),
    action: entry.action,
    resource: resourceRefToDoc(entry.resource),
    metadata: entry.metadata ?? null,
    originEventId: entry.originEventId ?? null,
    outcome: entry.outcome,
    occurredAt: entry.occurredAt,
  };
}
