// audit.module — Public API barrel
// Bounded Context: Audit Trail · Policy Automation / 稽核記錄
export type { AuditEntryDTO } from "./core/_use-cases";
export { recordAuditEntry, getAuditLogByResource, getAuditLogByWorkspace } from "./core/_use-cases";
export type { IAuditRepository } from "./domain.audit/_ports";
export type { ActorRef, ResourceRef } from "./domain.audit/_entity";
