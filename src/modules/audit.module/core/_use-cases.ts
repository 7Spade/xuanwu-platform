import { ok, fail } from "@/shared";
import type { Result } from "@/shared";
import type { AuditEntry, ActorRef, ResourceRef } from "../domain.audit/_entity";
import { buildAuditEntry } from "../domain.audit/_entity";
import type { AuditEntryId, AuditAction } from "../domain.audit/_value-objects";
import type { IAuditRepository } from "../domain.audit/_ports";

export interface AuditEntryDTO {
  readonly id: string;
  readonly actorAccountHandle: string | null;
  readonly actorAccountId: string;
  readonly action: AuditAction;
  readonly resourceType: string;
  readonly resourceId: string;
  readonly workspaceId?: string;
  readonly outcome: "success" | "blocked";
  readonly occurredAt: string;
}

function entityToDTO(e: AuditEntry): AuditEntryDTO {
  return {
    id: e.id,
    actorAccountHandle: e.actor.accountHandle,
    actorAccountId: e.actor.accountId,
    action: e.action,
    resourceType: e.resource.resourceType,
    resourceId: e.resource.resourceId,
    workspaceId: e.resource.workspaceId,
    outcome: e.outcome,
    occurredAt: e.occurredAt,
  };
}

export async function recordAuditEntry(
  repo: IAuditRepository,
  id: string,
  actor: ActorRef,
  action: AuditAction,
  resource: ResourceRef,
  metadata?: Record<string, unknown>,
  originEventId?: string,
): Promise<Result<AuditEntryDTO>> {
  try {
    const now = new Date().toISOString();
    const entry = buildAuditEntry(
      id as AuditEntryId, actor, action, resource, now, metadata, originEventId,
    );
    await repo.append(entry);
    return ok(entityToDTO(entry));
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

export async function getAuditLogByResource(
  repo: IAuditRepository,
  resourceId: string,
  limit?: number,
): Promise<Result<AuditEntryDTO[]>> {
  try {
    const entries = await repo.findByResourceId(resourceId, limit);
    return ok(entries.map(entityToDTO));
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

export async function getAuditLogByWorkspace(
  repo: IAuditRepository,
  workspaceId: string,
  limit?: number,
): Promise<Result<AuditEntryDTO[]>> {
  try {
    const entries = await repo.findByWorkspaceId(workspaceId, limit);
    return ok(entries.map(entityToDTO));
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}
