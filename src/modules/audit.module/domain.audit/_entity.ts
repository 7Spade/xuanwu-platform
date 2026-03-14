import type { AuditEntryId, AuditAction } from "./_value-objects";

/** Reference to the actor performing the audited action. */
export interface ActorRef {
  readonly identityId: string;
  readonly accountId: string;
  readonly accountHandle: string | null;
}

/** Reference to the resource that was acted upon. */
export interface ResourceRef {
  readonly resourceType: string;
  readonly resourceId: string;
  readonly workspaceId?: string;
}

/**
 * AuditEntry — immutable append-only audit record.
 *
 * Invariants:
 *   - AuditEntries are append-only: they cannot be updated or deleted.
 *   - Each entry captures: actor, action, resource, timestamp, and optional metadata.
 *   - Entries reference the originating domain event id for traceability.
 */
export interface AuditEntry {
  readonly id: AuditEntryId;
  readonly actor: ActorRef;
  readonly action: AuditAction;
  readonly resource: ResourceRef;
  /** Optional structured diff snapshot or change metadata. */
  readonly metadata?: Record<string, unknown>;
  /** Originating domain event id for traceability. */
  readonly originEventId?: string;
  readonly outcome: "success" | "blocked";
  readonly occurredAt: string; // ISO-8601
}

export function buildAuditEntry(
  id: AuditEntryId,
  actor: ActorRef,
  action: AuditAction,
  resource: ResourceRef,
  occurredAt: string,
  metadata?: Record<string, unknown>,
  originEventId?: string,
): AuditEntry {
  return {
    id, actor, action, resource,
    metadata, originEventId,
    outcome: "success",
    occurredAt,
  };
}
