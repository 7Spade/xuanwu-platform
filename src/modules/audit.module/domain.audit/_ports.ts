import type { AuditEntry } from "./_entity";
import type { AuditEntryId } from "./_value-objects";

export interface IAuditRepository {
  /** Append a new audit entry. Audit entries are immutable once written. */
  append(entry: AuditEntry): Promise<void>;
  findById(id: AuditEntryId): Promise<AuditEntry | null>;
  findByResourceId(resourceId: string, limit?: number): Promise<AuditEntry[]>;
  findByActorId(actorId: string, limit?: number): Promise<AuditEntry[]>;
  findByWorkspaceId(workspaceId: string, limit?: number): Promise<AuditEntry[]>;
}
