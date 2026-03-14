// audit.module — Public API barrel
// Bounded Context: Audit Trail · Policy Automation / 稽核記錄 · 政策自動化
// Layer: SaaS (cross-cutting — captures immutable event logs across all bounded contexts)
//
// audit.module provides:
//   - Immutable audit trail: records WHO did WHAT to WHICH artifact at WHAT time
//   - Integrity checks: policy rules that enforce workspace governance (e.g. required approvals)
//   - Compliance reporting: query and export audit logs for regulatory or internal review
//   - Policy automation (Sec): cross-module policy checks previously unowned
//
// This module also takes ownership of the 'Sec' participant from core-logic.mermaid
// (Integrity & Policy Automation), which was previously unassigned.
//
// Relationship to other modules:
//   - All modules: publish domain events; audit.module subscribes and records entries
//   - identity.module: actor identity resolved from IdentityId
//   - account.module: actor account resolved for display (name, handle)
//   - workspace.module: workspace governance rules (required CR approvals, QA sign-off)
//
// Re-export DTOs, actions, and queries as they are implemented.
// NEVER export entities, value objects, repositories, or domain events.
export {};
