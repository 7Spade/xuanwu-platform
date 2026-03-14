// audit.module — Public API barrel
// Bounded Context: Audit Trail · Policy Automation / 稽核記錄
export type { AuditEntryDTO } from "./core/_use-cases";
export { recordAuditEntry, getAuditLogByResource, getAuditLogByWorkspace } from "./core/_use-cases";
export type { IAuditRepository } from "./domain.audit/_ports";
export type { ActorRef, ResourceRef } from "./domain.audit/_entity";
// Presentation components (client-only)
export { AuditLogView } from "./_components/audit-log-view";
export { WorkspaceAuditView } from "./_components/workspace-audit-view";
export { useWorkspaceAuditLog, useResourceAuditLog } from "./_components/use-audit-log";
export type { AuditDisplayEntry, AuditEntryType } from "./_components/use-audit-log";
